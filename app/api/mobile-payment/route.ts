import { sendEmail, generateOrderConfirmationEmailHtml, generateGiftEmailHtml } from "@/lib/email"
import { sendTelegramNotification } from "@/lib/telegram"
import { supabaseAdmin as supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"
import crypto from "crypto"

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
      orderId,
      signature,
      orderKey,
      isGift,
      recipientName,
      recipientEmail,
      giftMessage,
      location,
      coordinates
    } = await req.json()

    // ── 1. Verify Razorpay Signature (HMAC-SHA256) ────────────────────────────
    // If signature is provided (real Razorpay flow), verify it.
    // If not (legacy/test flow), skip verification.
    if (signature && orderId) {
      const keySecret = process.env.RAZORPAY_KEY_SECRET
      if (!keySecret) {
        return NextResponse.json({ error: "Payment gateway configuration error" }, { status: 500 })
      }

      const text = `${orderId}|${paymentId}`
      const expectedSig = crypto
        .createHmac("sha256", keySecret)
        .update(text)
        .digest("hex")

      if (expectedSig !== signature) {
        console.error("Signature mismatch!", { expected: expectedSig, received: signature })
        return NextResponse.json({ error: "Payment verification failed — signature mismatch" }, { status: 400 })
      }
    }

    // ── 2. Fetch User Profile ─────────────────────────────────────────────────
    const { data: profile } = await supabase
      .from("profiles")
      .select("trees_planted, email, full_name")
      .eq("id", userId)
      .single()

    const currentTrees = profile?.trees_planted || 0
    const treesCount = parseInt(String(trees || "1"))
    const newTotal = currentTrees + treesCount

    // ── 3. Update Profile Tree Count ──────────────────────────────────────────
    await supabase
      .from("profiles")
      .update({ trees_planted: newTotal })
      .eq("id", userId)

    // ── 4. Insert into planting_orders ────────────────────────────────────────
    const finalOrderKey = orderKey || orderId || `mob_${Date.now()}`
    const { error: plantingError, data: order } = await supabase
      .from("planting_orders")
      .insert({
        user_id: userId,
        steward_name: stewardName || profile?.full_name || "Steward",
        trees: treesCount,
        plan_name: planName,
        occasion: occasion || null,
        status: "Pending",
        amount_paid: parseFloat(String(amountPaid || "0")),
        payment_id: paymentId,
        order_key: finalOrderKey,
        is_csr: treesCount >= 50,
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

    // ── 5. Send Email Receipt to Customer ─────────────────────────────────────
    const orderDate = new Date().toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric"
    })

    const targetEmail = userEmail || profile?.email || ""
    if (targetEmail) {
      await sendEmail({
        to: targetEmail,
        bcc: process.env.ADMIN_EMAIL,
        subject: `Invoice #${paymentId.slice(-6).toUpperCase()} — Your Green Legacy Has Begun 🌱`,
        html: generateOrderConfirmationEmailHtml(
          stewardName || profile?.full_name || "Steward",
          treesCount,
          planName,
          parseFloat(String(amountPaid || "0")),
          paymentId.slice(-8).toUpperCase(),
          orderDate,
          occasion || null
        )
      })
    }

    // ── 6. Gift Recipient Email ───────────────────────────────────────────────
    if (isGift && recipientEmail) {
      const claimUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://greenlegacy.in"}/login?claim=${paymentId}`
      await sendEmail({
        to: recipientEmail,
        subject: `🎁 A Surprise Legacy from ${stewardName || profile?.full_name || "a Friend"}!`,
        html: generateGiftEmailHtml(
          stewardName || profile?.full_name || "Your Friend",
          recipientName || "Steward",
          treesCount,
          planName,
          giftMessage || "",
          claimUrl
        )
      })
    }

    // ── 7. Telegram Admin Alert ───────────────────────────────────────────────
    const telegramMsg = `
🌳 <b>New Mobile Planting Order!</b> (App)
👤 <b>User:</b> ${stewardName || profile?.full_name || "Unknown"}
📧 <b>Email:</b> ${targetEmail || "N/A"}
📦 <b>Plan:</b> ${planName} (${treesCount} tree${treesCount > 1 ? "s" : ""})
🎂 <b>Occasion:</b> ${occasion || "None"}
💰 <b>Amount:</b> ₹${amountPaid}
💳 <b>Payment ID:</b> <code>${paymentId}</code>
📍 <b>Location:</b> ${location || "GKVK Campus"}
${isGift ? `🎁 <b>Gift For:</b> ${recipientName} (${recipientEmail})` : ""}
    `.trim()

    await sendTelegramNotification(telegramMsg)

    // ── 8. Admin Email Alert ──────────────────────────────────────────────────
    if (process.env.ADMIN_EMAIL) {
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `🌳 NEW MOBILE ORDER: ${stewardName || profile?.full_name} — ${treesCount} Trees — ₹${amountPaid}`,
        html: `
          <div style="font-family: 'Manrope', sans-serif; padding: 24px; border: 1px solid #e3e3db; border-radius: 16px; max-width: 600px;">
            <div style="background: #064E3B; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
              <h2 style="color: #b2f432; margin: 0; font-size: 20px;">🌱 New Mobile Botanical Legacy</h2>
              <p style="color: rgba(255,255,255,0.7); margin: 4px 0 0; font-size: 13px;">Via Green Legacy Android App</p>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 8px 0; color: #888;">Steward</td><td style="font-weight: bold;">${stewardName || profile?.full_name}</td></tr>
              <tr><td style="padding: 8px 0; color: #888;">Email</td><td>${targetEmail}</td></tr>
              <tr><td style="padding: 8px 0; color: #888;">Plan</td><td style="font-weight: bold;">${planName} (${treesCount} Trees)</td></tr>
              <tr><td style="padding: 8px 0; color: #888;">Occasion</td><td style="color: #16A34A; font-weight: bold;">${occasion || "General Stewardship"}</td></tr>
              <tr><td style="padding: 8px 0; color: #888;">Amount Paid</td><td style="font-weight: bold; font-size: 16px;">₹${amountPaid}</td></tr>
              <tr><td style="padding: 8px 0; color: #888;">Payment ID</td><td style="font-family: monospace; font-size: 12px;">${paymentId}</td></tr>
              ${isGift ? `<tr><td style="padding: 8px 0; color: #888;">Gift For</td><td>${recipientName} (${recipientEmail})</td></tr>` : ""}
            </table>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #888; text-align: center;">This order is now pending in your <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://greenlegacy.in"}/admin" style="color: #16A34A;">Admin Dashboard</a>.</p>
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
