"use server"

import { stripe } from "@/lib/stripe"
import { supabase } from "@/lib/supabase"
import { sendEmail, generatePlantingEmailHtml } from "@/lib/email"

export async function verifyAndRecordPlanting(sessionId: string) {
  try {
    // 1. Retrieve the session from Stripe to verify payment
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (session.payment_status !== "paid") {
      return { success: false, message: "Payment not completed" }
    }

    const userId = session.metadata?.userId
    const trees = parseInt(session.metadata?.trees || "0")

    if (!userId || trees <= 0) {
      return { success: false, message: "Invalid session metadata" }
    }

    // 2. Check if this transaction has already been processed (optional but good)
    // For now, we'll just update the profile. 
    // In a prod app, you should have a 'transactions' table to prevent double counting.

    // 3. Update the user's tree count in Supabase
    const { data: profileData, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError) throw fetchError
    const profile = profileData as any

    const currentTrees = profile?.trees_planted || 0
    const newTotal = currentTrees + trees

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ trees_planted: newTotal })
      .eq('id', userId)

    if (updateError) throw updateError

    // 4. Send Confirmation Email to User
    await sendEmail({
      to: session.customer_details?.email || profile?.email || "",
      subject: "Your Legacy is Planted - Geo-Location Established",
      html: generatePlantingEmailHtml(
        profile?.full_name || "Steward",
        trees,
        "Silver Oak Estate, Karnataka",
        "13.0827, 77.5877"
      )
    })

    // 5. Notify Admin about new order
    await sendEmail({
      to: "greenlegacy.org@gmail.com",
      subject: `NEW ORDER: ${trees} Trees by ${profile?.full_name || "Steward"}`,
      html: `
        <h2>New Planting Order Received</h2>
        <p><strong>Steward:</strong> ${profile?.full_name}</p>
        <p><strong>Email:</strong> ${profile?.email}</p>
        <p><strong>Quantity:</strong> ${trees} Trees</p>
        <p><strong>Product ID:</strong> ${session.metadata?.productId}</p>
        <p><strong>Transaction ID:</strong> ${session.id}</p>
        <hr/>
        <p>Please plant these trees and update the registry with actual coordinates and photos.</p>
      `
    })

    return { success: true, newTotal }
  } catch (error: any) {
    console.error("Error recording planting:", error)
    return { success: false, error: error.message }
  }
}
