"use server"

import { razorpay } from "@/lib/razorpay"
import { supabase } from "@/lib/supabase"
import { PRODUCTS, SUBSCRIPTIONS } from "@/lib/products"
import crypto from "crypto"

export async function createRazorpayOrder(
  productId: string, 
  userId: string, 
  occasion?: string | null,
  isCsr?: boolean,
  companyName?: string,
  gstNumber?: string
) {
  try {
    const { data: dbProduct } = await supabase
      .from('site_products')
      .select('*')
      .eq('id', productId)
      .single()

    const product = dbProduct || PRODUCTS.find((p) => p.id === productId) || SUBSCRIPTIONS.find((s) => s.id === productId)
    if (!product) return { error: "Plan not found in registry" }

    let amount = product.price_in_cents || product.priceInCents
    if (!amount || amount < 100) {
      // Razorpay requires minimum 1.00 INR (100 paise)
      amount = 100 
    }

    // Handle One-Time Payment
    if (product.mode === 'payment') {
      const options = {
        amount,
        currency: "INR",
        receipt: `receipt_${Date.now()}_${userId.slice(0, 5)}`,
        notes: { 
          userId, 
          productId, 
          occasion: occasion || "",
          is_csr: isCsr ? 'true' : 'false',
          company_name: companyName || "",
          gst_number: gstNumber || ""
        },
      }
      const order = await razorpay.orders.create(options)
      return { id: order.id, amount: order.amount, currency: order.currency, mode: 'payment' }
    } 
    
    // Handle Recurring Subscription
    else {
      // Note: In production, 'plan_id' should come from your Razorpay Dashboard
      // For now, we use a fallback or an environment variable
      const planId = process.env[`RAZORPAY_PLAN_${productId.toUpperCase().replace(/-/g, '_')}`] || 'plan_default_placeholder'
      
      const subscription = await razorpay.subscriptions.create({
        plan_id: planId,
        total_count: 12, // Default to 1 year of impact
        quantity: 1,
        notes: { 
          userId, 
          productId, 
          occasion: occasion || "",
          is_csr: isCsr ? 'true' : 'false',
          company_name: companyName || "",
          gst_number: gstNumber || ""
        },
      })
      
      return { 
        id: subscription.id, 
        amount: amount, 
        currency: "INR", 
        mode: 'subscription' 
      }
    }
  } catch (error: any) {
    console.error("Razorpay Generation Error:", error)
    return { error: error.message || "Failed to initialize payment gateway" }
  }
}

export async function verifyRazorpayPayment(
  orderId: string,
  paymentId: string,
  signature: string,
  metadata: { 
    userId: string, 
    productId: string, 
    occasion: string,
    is_csr?: boolean,
    company_name?: string,
    gst_number?: string
  }
) {
  try {
    // 1. Verify Signature
    const text = orderId + "|" + paymentId
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest("hex")

    if (expectedSignature !== signature) {
      return { success: false, error: "Invalid payment signature" }
    }

    // 2. Fetch Product Details
    const { data: dbProduct } = await supabase
      .from('site_products')
      .select('*')
      .eq('id', metadata.productId)
      .single()

    const product = dbProduct || PRODUCTS.find((p) => p.id === metadata.productId) || SUBSCRIPTIONS.find((s) => s.id === metadata.productId)
    if (!product) throw new Error("Product not found")

    const productPrice = product.price_in_cents || product.priceInCents

    // 3. Update Profile or Record Planting
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", metadata.userId)
      .single()

    const currentTrees = profile?.trees_planted || 0
    const newTotal = currentTrees + product.trees

    await supabase
      .from("profiles")
      .update({ 
        trees_planted: newTotal,
        stripe_customer_id: paymentId // Reusing column for convenience
      })
      .eq("id", metadata.userId)

    const { error: plantingError } = await supabase
      .from("planting_orders")
      .insert({
        user_id: metadata.userId,
        steward_name: profile?.full_name || "Steward",
        trees: product.trees,
        plan_name: product.name,
        occasion: metadata.occasion || null,
        status: "Pending",
        amount_paid: productPrice / 100,
        payment_id: paymentId,
        order_key: orderId,
        is_csr: metadata.is_csr || false,
        company_name: metadata.company_name || null,
        gst_number: metadata.gst_number || null
      })

    if (plantingError) throw plantingError

    // 4. Notifications (Email to Customer + Admin Alerts)
    try {
      const { sendEmail, generateOrderConfirmationEmailHtml } = await import("@/lib/email")
      
      // Custom formatted date
      const orderDate = new Date().toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      })

      // Email to Customer (Confirmation + Invoice)
      await sendEmail({
        to: profile?.email || "",
        subject: `Invoice #${paymentId.slice(-6).toUpperCase()} - Your Botanical Legacy has Begun`,
        html: generateOrderConfirmationEmailHtml(
          profile?.full_name || "Steward",
          product.trees,
          product.name,
          productPrice / 100, // amountPaid
          paymentId.slice(-8).toUpperCase(), // orderId formatted for invoice
          orderDate, // date
          metadata.occasion || null // occasion
        )
      })

      // Telegram to Admin
      const { sendTelegramNotification } = await import("@/lib/telegram")
      const adminMessage = `
🌳 <b>New Planting Order!</b>
👤 <b>User:</b> ${profile?.full_name || "Unknown"}
📧 <b>Email:</b> ${profile?.email || "N/A"}
📦 <b>Plan:</b> ${product.name} (${product.trees} trees)
🎂 <b>Occasion:</b> ${metadata.occasion || "None"}
💰 <b>Amount:</b> ₹${productPrice / 100}
💳 <b>Payment ID:</b> <code>${paymentId}</code>
      `.trim()
      
      await sendTelegramNotification(adminMessage)

      // Email to Admin
      if (process.env.ADMIN_EMAIL) {
        await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: `🌳 NEW ORDER: ${profile?.full_name} - ${product.trees} Trees`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e3e3db; border-radius: 12px;">
              <h2 style="color: #233600;">New Botanical Legacy Established</h2>
              <p><b>Steward:</b> ${profile?.full_name}</p>
              <p><b>Phone:</b> ${profile?.phone || 'Not Provided'}</p>
              <p><b>Plan:</b> ${product.name} (${product.trees} Trees)</p>
              <p><b>Amount Paid:</b> ₹${productPrice / 100}</p>
              <p><b>Occasion:</b> <span style="color: #b2f432; font-weight: bold;">${metadata.occasion || 'General Stewardship'}</span></p>
              <p><b>Payment ID:</b> ${paymentId}</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #888;">This order is now pending in your <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin">Admin Dashboard</a>.</p>
            </div>
          `
        })
      }
    } catch (e) {
      console.warn("Notification Service Warning:", e)
    }

    return { success: true }
  } catch (error: any) {
    console.error("Razorpay Verification Error:", error)
    return { success: false, error: error.message }
  }
}
