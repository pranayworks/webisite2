"use server"

import { supabase } from "@/lib/supabase"
import { sendEmail, generatePlantingEmailHtml } from "@/lib/email"

/**
 * Historical Stripe verification (Deprecated)
 */
export async function verifyAndRecordPlanting(sessionId: string) {
  return { success: false, message: "Stripe migration active. Use Razorpay flow." }
}

export async function addGrowthUpdate(orderId: string, note: string, photoUrl?: string) {
  try {
    const { error } = await supabase
      .from('growth_updates')
      .insert([{
        order_id: orderId,
        note: note,
        photo_url: photoUrl || "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=800",
        created_at: new Date().toISOString()
      }])

    if (error) throw error

    // Notifications (Optional background)
    try {
      const { data: order } = await supabase.from('planting_orders').select('user_id, plan_name').eq('id', orderId).single()
      if (order) {
        const { data: profile } = await supabase.from('profiles').select('email, full_name').eq('id', order.user_id).single()
        if (profile) {
          const { generateGrowthUpdateEmailHtml, sendEmail } = await import("@/lib/email")
          const { sendTelegramNotification } = await import("@/lib/telegram")

          // Notify User
          await sendEmail({
            to: profile.email,
            subject: `Growth Update: Your ${order.plan_name} is evolving`,
            html: generateGrowthUpdateEmailHtml(profile.full_name, note, photoUrl || "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=800")
          })

          // Notify Admin
          await sendTelegramNotification(`📈 <b>Growth Update Dispatched</b>\n👤 <b>User:</b> ${profile.full_name}\n🌳 <b>Plan:</b> ${order.plan_name}\n📝 <b>Note:</b> ${note}`)
        }
      }
    } catch (e) {
      console.warn("Milestone Notification Failure:", e)
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error adding growth update:", error)
    return { success: false, error: error.message }
  }
}

export async function updateProfile(userId: string, data: { 
  full_name?: string, 
  phone_number?: string, 
  age?: number, 
  gender?: string 
}) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    console.error("Error updating profile:", error)
    return { success: false, error: error.message }
  }
}
