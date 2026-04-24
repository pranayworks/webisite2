"use server"

import { sendTelegramNotification } from "@/lib/telegram"
import { sendEmail } from "@/lib/email"

export async function testTelegramAction() {
  try {
    const message = `
🚀 <b>Arboretum Diagnostic</b>
System: Telegram Notification Relay
Status: Operational
Timestamp: ${new Date().toLocaleString()}
<i>This is a test message to verify your bot configuration.</i>
    `.trim()
    
    const result = await sendTelegramNotification(message)
    return result
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function testEmailAction(adminEmail: string) {
  try {
    if (!adminEmail) throw new Error("Admin email not configured")
    
    const result = await sendEmail({
      to: adminEmail,
      subject: "Arboretum System Diagnostic",
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #b2f432;">Relay Diagnostic Success</h2>
          <p>Your SMTP configuration is active and capable of sending system alerts.</p>
          <hr />
          <p style="font-size: 12px; color: #666;">Timestamp: ${new Date().toLocaleString()}</p>
        </div>
      `
    })
    return result
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function testInquiryEmailAction(adminEmail: string) {
  try {
    const { generateInquiryEmailHtml } = await import("@/lib/email")
    const result = await sendEmail({
      to: adminEmail,
      subject: "PREVIEW: New Site Inquiry",
      html: generateInquiryEmailHtml(
        "Aris Thorne", 
        "aris@example.com", 
        "+91 98765 43210", 
        "Bulk Planting for Anniversary", 
        "We are looking to plant 50 trees for our diamond anniversary. Can we customize the certificates?"
      )
    })
    return result
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function testGrowthEmailAction(adminEmail: string) {
  try {
    const { generateGrowthUpdateEmailHtml } = await import("@/lib/email")
    const result = await sendEmail({
      to: adminEmail,
      subject: "PREVIEW: Growth Milestone Reached",
      html: generateGrowthUpdateEmailHtml(
        "Aris Thorne", 
        "The first leaves have sprouted! Your Banyan tree is showing remarkable vigor after the monsoon.", 
        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800"
      )
    })
    return result
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function testOrderConfirmationEmailAction(adminEmail: string) {
  try {
    const { generateOrderConfirmationEmailHtml } = await import("@/lib/email")
    const html = generateOrderConfirmationEmailHtml(
       "Aris Thorne",
       5,
       "Forest (One-Time)",
       1250,
       "TST_892MX",
       new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
       "General Legacy"
     )
    const result = await sendEmail({
      to: adminEmail,
      subject: "PREVIEW: Your Botanical Legacy has Begun",
      html: html
    })
    return result
  } catch (error: any) {
    console.error("Order Confirmation Preview FAIL:", error)
    return { success: false, error: error.message || "Unknown error in diagnostic action" }
  }
}
