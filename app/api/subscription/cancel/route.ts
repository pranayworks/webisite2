import { NextResponse } from "next/server"
import { razorpay } from "@/lib/razorpay"
import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const { subscriptionId, orderId } = await req.json()

    if (!subscriptionId || !subscriptionId.startsWith('sub_')) {
      return NextResponse.json({ error: "Invalid subscription identifier." }, { status: 400 })
    }

    // 1. Cancel the subscription directly in Razorpay
    // The second boolean 'false' means we do not refund or cancel immediately with prejudice,
    // we just halt the recurring engine. In Razorpay: cancel(id, cancel_at_cycle_end)
    await razorpay.subscriptions.cancel(subscriptionId)

    // 2. Update local database to reflect cancellation
    if (orderId) {
      await supabase
        .from('planting_orders')
        .update({ status: 'Canceled' })
        .eq('id', orderId)
    }

    return NextResponse.json({ success: true, message: "Subscription auto-renewal canceled." })
  } catch (error: any) {
    console.error("Subscription Cancellation Error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to cancel subscription at the Gateway." }, 
      { status: 500 }
    )
  }
}
