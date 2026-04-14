"use server"

import { sendEmail } from "@/lib/email"

export async function sendWelcomeEmail(name: string, email: string) {
  try {
    await sendEmail({
      to: email,
      subject: "Welcome to Green Legacy 🌱",
      html: `
        <div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #f9fafb; padding: 60px 20px; color: #1a1c18;">
          <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 24px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="display: inline-block; background: #b2f432; color: #233600; padding: 8px 20px; border-radius: 50px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Welcome to the Family</div>
            </div>

            <h1 style="font-size: 28px; font-weight: 800; text-align: center; margin: 0 0 16px 0; color: #121410; line-height: 1.3;">
              Welcome, ${name}! 🌿
            </h1>
            <p style="text-align: center; color: #424935; font-size: 16px; line-height: 1.7; margin-bottom: 36px;">
              You've just joined a growing community of stewards dedicated to building a greener India — one tree at a time. We're thrilled to have you.
            </p>

            <div style="background: #f8faf5; border-radius: 20px; padding: 28px; margin-bottom: 36px; border: 1px solid rgba(66,73,53,0.08);">
              <h3 style="margin: 0 0 16px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #233600;">🌳 What you can do next</h3>
              <ul style="padding: 0; margin: 0; list-style: none; font-size: 14px; color: #424935; line-height: 2.2;">
                <li>🪴 Choose a planting plan and start your legacy</li>
                <li>📊 Track your trees and impact from the dashboard</li>
                <li>🎂 Gift a tree for birthdays, anniversaries, or memorials</li>
                <li>🤝 Invite friends and grow the community</li>
              </ul>
            </div>

            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/subscriptions" style="display: inline-block; background-color: #121410; color: #b2f432; padding: 16px 36px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Plant Your First Tree →</a>
            </div>

            <p style="text-align: center; font-size: 13px; color: #c2caaf; line-height: 1.6;">
              If you have any questions, simply reply to this email — we're always here to help.
            </p>
          </div>
          <p style="text-align: center; font-size: 10px; color: #c2caaf; margin-top: 24px; text-transform: uppercase; letter-spacing: 1px;">© 2026 Green Legacy • Planting Today, Thriving Tomorrow</p>
        </div>
      `
    })
    return { success: true }
  } catch (e) {
    console.warn("Welcome email failed:", e)
    return { success: false }
  }
}

export async function sendRsvpConfirmationEmail(name: string, email: string, eventTitle: string, eventDate: string, eventLocation: string) {
  try {
    await sendEmail({
      to: email,
      subject: `Your RSVP is confirmed — ${eventTitle} 🌱`,
      html: `
        <div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #f9fafb; padding: 60px 20px; color: #1a1c18;">
          <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 24px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">

            <div style="text-align: center; margin-bottom: 30px;">
              <div style="display: inline-block; background: #b2f432; color: #233600; padding: 8px 20px; border-radius: 50px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">RSVP Confirmed ✅</div>
            </div>

            <h1 style="font-size: 26px; font-weight: 800; text-align: center; margin: 0 0 12px 0; color: #121410;">
              You're in, ${name}!
            </h1>
            <p style="text-align: center; color: #424935; font-size: 15px; line-height: 1.7; margin-bottom: 36px;">
              Your spot has been reserved for <b>${eventTitle}</b>. We can't wait to plant alongside you!
            </p>

            <div style="background: #f8faf5; border-radius: 20px; padding: 28px; margin-bottom: 36px; border: 1px solid rgba(66,73,53,0.08);">
              <h3 style="margin: 0 0 16px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #233600;">📅 Event Details</h3>
              <table style="width: 100%; font-size: 14px; color: #424935; border-collapse: collapse;">
                <tr><td style="padding: 6px 0; font-weight: 600; width: 40%;">Event</td><td>${eventTitle}</td></tr>
                <tr><td style="padding: 6px 0; font-weight: 600;">Date</td><td>${eventDate}</td></tr>
                <tr><td style="padding: 6px 0; font-weight: 600;">Location</td><td>${eventLocation}</td></tr>
              </table>
            </div>

            <p style="text-align: center; font-size: 13px; color: #424935; margin-bottom: 28px;">
              Please arrive 15 minutes early. Wear comfortable clothing and closed-toe shoes. We'll provide everything else!
            </p>

            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/get-involved" style="display: inline-block; background-color: #121410; color: #b2f432; padding: 16px 36px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">View All Events</a>
            </div>
          </div>
          <p style="text-align: center; font-size: 10px; color: #c2caaf; margin-top: 24px; text-transform: uppercase; letter-spacing: 1px;">© 2026 Green Legacy • Planting Today, Thriving Tomorrow</p>
        </div>
      `
    })
    return { success: true }
  } catch (e) {
    console.warn("RSVP email failed:", e)
    return { success: false }
  }
}

export async function saveRsvp(data: {
  name: string
  email: string
  phone: string
  eventTitle: string
  eventDate: string
  eventLocation: string
}) {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    await supabase.from('event_rsvps').insert({
      name: data.name,
      email: data.email,
      phone: data.phone,
      event_title: data.eventTitle,
      event_date: data.eventDate,
      event_location: data.eventLocation,
    })

    // Send confirmation email
    await sendRsvpConfirmationEmail(data.name, data.email, data.eventTitle, data.eventDate, data.eventLocation)

    return { success: true }
  } catch (e: any) {
    console.error("RSVP save error:", e)
    return { success: false, error: e.message }
  }
}
