import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature')
    
    // 1. Verify Webhook Signature (Security)
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!secret || !signature) {
      return NextResponse.json({ error: 'Webhook secret or signature missing' }, { status: 400 })
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex')

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(body)
    console.log('Razorpay Webhook Event:', event.event)

    // 2. Handle Recurring Charges (Month 2 and beyond)
    // Event: subscription.charged
    if (event.event === 'subscription.charged') {
      const subscription = event.payload.subscription.entity
      const payment = event.payload.payment.entity
      
      const { userId, productId, occasion, is_csr, company_name, gst_number } = subscription.notes || {}

      if (!userId || !productId) {
        console.warn('Missing metadata in subscription notes')
        return NextResponse.json({ success: true })
      }

      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      // Calculate new tree total
      const treeCount = productId === 'annual-forest' ? 30 : productId === 'quarterly-grove' ? 4 : 1
      const currentTrees = profile?.trees_planted || 0
      
      // Update Profile
      await supabase
        .from('profiles')
        .update({ trees_planted: currentTrees + treeCount })
        .eq('id', userId)

      // Add to Admin Planting Queue
      await supabase
        .from('planting_orders')
        .insert({
          user_id: userId,
          steward_name: profile?.full_name || "Steward",
          trees: treeCount,
          plan_name: `Recurring: ${productId}`,
          occasion: occasion || "Subscription Renewal",
          status: "Pending",
          amount_paid: payment.amount / 100,
          payment_id: payment.id,
          order_key: subscription.id,
          is_csr: is_csr === 'true' || false,
          company_name: company_name || null,
          gst_number: gst_number || null
        })

      console.log(`Successfully processed recurring charge for ${userId}: +${treeCount} trees`)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Webhook Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
