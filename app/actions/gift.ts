"use server"

import { supabase } from "../../lib/supabase"

export async function claimGift(paymentId: string, userId: string) {
  try {
    // 1. Find the gift order
    const { data: order, error: fetchError } = await supabase
      .from('planting_orders')
      .select('*')
      .eq('payment_id', paymentId)
      .eq('is_gift', true)
      .single()

    if (fetchError || !order) {
      return { success: false, error: "Gift record not found or already claimed." }
    }

    // 2. Check if the order is already assigned to this user to avoid double counting
    if (order.user_id === userId) {
      return { success: true, alreadyClaimed: true }
    }
    
    // 3. Update the order with the new user_id
    const { error: updateError } = await supabase
      .from('planting_orders')
      .update({ 
        user_id: userId,
      })
      .eq('payment_id', paymentId)

    if (updateError) throw updateError

    // 4. Update the user's profile tree count
    const { data: profile } = await supabase
      .from('profiles')
      .select('trees_planted')
      .eq('id', userId)
      .single()

    const newTotal = (profile?.trees_planted || 0) + order.trees
    await supabase
      .from('profiles')
      .update({ trees_planted: newTotal })
      .eq('id', userId)

    return { success: true, trees: order.trees }
  } catch (error: any) {
    console.error("Gift Claim Error:", error)
    return { success: false, error: error.message }
  }
}
