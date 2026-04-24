import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY! // Needs service layer permissions for cron
const RESEND_API_KEY = process.env.RESEND_API_KEY

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  // Authentication check so the CRON cannot be triggered externally without the secret.
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Ensure env variables exist
  if (!SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_URL) {
      return NextResponse.json({ error: 'Missing Supabase Config' }, { status: 500 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const date3MonthsAgoStart = new Date(today)
    date3MonthsAgoStart.setDate(date3MonthsAgoStart.getDate() - 90)
    const date3MonthsAgoEnd = new Date(date3MonthsAgoStart)
    date3MonthsAgoEnd.setHours(23, 59, 59, 999)

    const date6MonthsAgoStart = new Date(today)
    date6MonthsAgoStart.setDate(date6MonthsAgoStart.getDate() - 180)
    const date6MonthsAgoEnd = new Date(date6MonthsAgoStart)
    date6MonthsAgoEnd.setHours(23, 59, 59, 999)

    // Parallel fetch using Supabase Service Role for DB access
    const [threeMonthRes, sixMonthRes] = await Promise.all([
      supabase
        .from('planting_orders')
        .select(`id, steward_name, user_id, trees`)
        .gte('created_at', date3MonthsAgoStart.toISOString())
        .lte('created_at', date3MonthsAgoEnd.toISOString()),
      
      supabase
        .from('planting_orders')
        .select(`id, steward_name, user_id, trees`)
        .gte('created_at', date6MonthsAgoStart.toISOString())
        .lte('created_at', date6MonthsAgoEnd.toISOString())
    ])

    if (threeMonthRes.error) throw threeMonthRes.error
    if (sixMonthRes.error) throw sixMonthRes.error

    const emailsToSend = []

    // Map 3-Month Nurture
    for (const order of threeMonthRes.data || []) {
       const { data: profile } = await supabase.from('profiles').select('email').eq('id', order.user_id).single()
       if (profile?.email) {
         emailsToSend.push({
           to: profile.email,
           subject: 'Your Sapling is Thriving! 🌱 (3-Month Update)',
           html: `<p>Hello ${order.steward_name},</p><p>It's been exactly 3 months since you sponsored ${order.trees} trees. They are growing strong and taking root securely! Log in to your Stewardship Dashboard to view its progress.</p>`
         })
       }
    }

    // Map 6-Month Nurture
    for (const order of sixMonthRes.data || []) {
      const { data: profile } = await supabase.from('profiles').select('email').eq('id', order.user_id).single()
      if (profile?.email) {
        emailsToSend.push({
          to: profile.email,
          subject: 'Your Grove is Expanding! 🌳 (6-Month Update)',
          html: `<p>Hello ${order.steward_name},</p><p>A massive milestone! It's been 6 months since you sponsored ${order.trees} trees. Your contribution is actively sequestering carbon from the atmosphere.</p>`
        })
      }
   }

    // Send emails
    let processed = 0
    if (RESEND_API_KEY) {
      for (const email of emailsToSend) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'Green Legacy Nurture <updates@greenlegacy.in>',
            to: [email.to],
            subject: email.subject,
            html: email.html
          })
        })
        processed++
      }
    } else {
      console.log('No RESEND_API_KEY found. Targets to notify:', emailsToSend.length)
      processed = emailsToSend.length
    }

    return NextResponse.json({ success: true, targetsNotified: processed })

  } catch (err: any) {
    console.error('Milestone Nurture CRON Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
