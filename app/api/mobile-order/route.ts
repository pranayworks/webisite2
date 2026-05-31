import { razorpay } from "@/lib/razorpay"
import { NextResponse } from "next/server"

const PLAN_PRICES: Record<string, number> = {
  "Seedling": 29900,  // ₹299 in paise
  "Sapling":  59900,  // ₹599 in paise
  "Legacy":   199900, // ₹1,999 in paise
}

const PLAN_TREES: Record<string, number> = {
  "Seedling": 1,
  "Sapling":  1,
  "Legacy":   3,
}

export async function POST(req: Request) {
  try {
    const { planName, userId } = await req.json()

    if (!planName || !userId) {
      return NextResponse.json({ error: "planName and userId are required" }, { status: 400 })
    }

    const amountInPaise = PLAN_PRICES[planName]
    if (!amountInPaise) {
      return NextResponse.json({ error: `Unknown plan: ${planName}` }, { status: 400 })
    }

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `mob_${Date.now()}_${userId.slice(0, 6)}`,
      notes: {
        userId,
        planName,
        trees: String(PLAN_TREES[planName] || 1),
        source: "mobile_app"
      }
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      trees: PLAN_TREES[planName] || 1,
      razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ""
    })

  } catch (error: any) {
    console.error("Mobile Order Creation Error:", error)
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 })
  }
}
