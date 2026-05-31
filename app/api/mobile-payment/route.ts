import { sendEmail, generateOrderConfirmationEmailHtml, generateGiftEmailHtml } from "@/lib/email"
import { sendTelegramNotification } from "@/lib/telegram"
import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const {
      userId,
      stewardName,
      userEmail,
      trees,
      planName,
      occasion,
      amountPaid,
      paymentId,
      orderKey,
      isGift,
      recipientName,
      recipientEmail,
      giftMessage,
      location,
      coordinates
    } = await req.json()

    // 1. Update User's profile trees count
    const { data: profile } = await supabase
      .from("profiles")
      .select("trees_planted, email, full_name")
      .eq("id", userId)
      .single()

    const currentTrees = profile?.trees_planted || 0
    const newTotal = currentTrees + parseInt(trees || "1")

    await supabase
      .from("profiles")
      .update({ trees_planted: newTotal })
      .eq("id", userId)

    // 2. Insert into planting_orders
    const { error: plantingError, data: order } = await supabase
      .from("planting_orders")
      .insert({
        user_id: userId,
        steward_name: stewardName || profile?.full_name || "Steward",
        trees: parseInt(trees || "1"),
        plan_name: planName,
        occasion: occasion || null,
        status: "Pending",
        amount_paid: parseFloat(amountPaid || "0"),
        payment_id: paymentId,
        order_key: orderKey,
        is_csr: parseInt(trees || "1") >= 50,
        is_gift: isGift === true,
        recipient_name: isGift ? recipientName : null,
        recipient_email: isGift ? recipientEmail : null,
        gift_message: isGift ? giftMessage : null,
        location: location || "GKVK Campus",
        planting_gps: coordinates || "12.9716° N, 77.5946° E"
      })
      .select()
      .single()

    if (plantingError) throw plantingError

    // 3. Send Email Notification to Customer
    const orderDate = new Date().toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })

    const targetEmail = userEmail || profile?.email || ""
    if (targetEmail) {
      await sendEmail({
        to: targetEmail,
        bcc: process.env.ADMIN_EMAIL,
        subject: `Invoice #${paymentId.slice(-6).toUpperCase()} - Your Botanical Legacy has Begun`,
        html: generateOrderConfirmationEmailHtml(
          stewardName || profile?.full_name || "Steward",
          parseInt(trees || "1"),
          planName,
          parseFloat(amountPaid || "0"),
          paymentId.slice(-8).toUpperCase(),
          orderDate,
          occasion || null
        )
      })
    }

    // 4. Send Email Notification to Gift Recipient
    if (isGift && recipientEmail) {
      const claimUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://greenlegacy.in'}/login?claim=${paymentId}`
      await sendEmail({
        to: recipientEmail,
        subject: `🎁 A Surprise Legacy from ${stewardName || profile?.full_name || "a Friend"}!`,
        html: generateGiftEmailHtml(
          stewardName || profile?.full_name || "Your Friend",
          recipientName || "Steward",
          parseInt(trees || "1"),
          planName,
          giftMessage || "",
          claimUrl
        )
      })
    }

    // 5. Telegram Notification to Admin
    const telegramMsg = `
🌳 <b>New Mobile Planting Order!</b> (App)
👤 <b>User:</b> ${stewardName || profile?.full_name || "Unknown"}
📧 <b>Email:</b> ${targetEmail || "N/A"}
📦 <b>Plan:</b> ${planName} (${trees} trees)
🎂 <b>Occasion:</b> ${occasion || "None"}
💰 <b>Amount:</b> ₹${amountPaid}
💳 <b>Payment ID:</b> <code>${paymentId}</code>
📍 <b>Location:</b> ${location || "GKVK Campus"}
    `.trim()

    await sendTelegramNotification(telegramMsg)

    // 6. Admin Email Notification
    if (process.env.ADMIN_EMAIL) {
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `🌳 NEW MOBILE ORDER: ${stewardName || profile?.full_name} - ${trees} Trees`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e3e3db; border-radius: 12px;">
            <h2 style="color: #233600;">New Mobile Botanical Legacy Established</h2>
            <p><b>Steward:</b> ${stewardName || profile?.full_name}</p>
            <p><b>Plan:</b> ${planName} (${trees} Trees)</p>
            <p><b>Amount Paid:</b> ₹${amountPaid}</p>
            <p><b>Occasion:</b> <span style="color: #b2f432; font-weight: bold;">${occasion || 'General Stewardship'}</span></p>
            <p><b>Payment ID:</b> ${paymentId}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #888;">This order is now pending in your Admin Dashboard.</p>
          </div>
        `
      })
    }

    return NextResponse.json({ success: true, orderId: order?.id })
  } catch (error: any) {
    console.error("Mobile Payment Process Error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
