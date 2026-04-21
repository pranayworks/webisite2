'use server'

import nodemailer from 'nodemailer'

export async function submitContact(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const subject = formData.get('subject') as string
    const message = formData.get('message') as string

    // 1. Record in Supabase (Central Archive) - USING SERVICE ROLE FOR DIRECT ACCESS
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const { error: dbError } = await supabaseAdmin
      .from('contact_messages')
      .insert([{ name, email, phone, subject, message, status: 'Unread' }])
    
    if (dbError) {
      console.error("CRITICAL: Database save failed:", dbError);
    } else {
      console.log("Database save successful for inquiry:", subject);
    }

    // 2. Dynamic Routing Logic
    const routingMap: Record<string, string> = {
      'General': process.env.EMAIL_GENERAL || 'contact.greenlegacy@gmail.com',
      'Partnership': process.env.EMAIL_PARTNERSHIP || 'partnershipsgreenlegacy@gmail.com',
      'Media': process.env.EMAIL_MEDIA || 'mediagreenlegacy@gmail.com',
      'Campus': process.env.EMAIL_CAMPUS || 'campusgreenlegacy@gmail.com',
      'Support': process.env.EMAIL_SUPPORT || 'contact.greenlegacy@gmail.com'
    }

    const targetEmail = routingMap[subject as keyof typeof routingMap] || 'contact.greenlegacy@gmail.com'
    const adminEmail = process.env.ADMIN_EMAIL || 'mamidipranay07@gmail.com'

    // 3. Send Notifications (Target Department + Admin Archive)
    try {
      const { sendEmail, generateInquiryEmailHtml } = await import('@/lib/email')
      const { sendTelegramNotification } = await import('@/lib/telegram')

      const emailHtml = generateInquiryEmailHtml(name, email, phone, subject, message)

      // Send to Department
      await sendEmail({
        to: targetEmail,
        subject: `🌱 [${subject}] New Inquiry from ${name}`,
        html: emailHtml
      })

      // Archive a copy to Admin if different from target
      if (adminEmail !== targetEmail) {
        await sendEmail({
          to: adminEmail,
          subject: `🌱 [ARCHIVE] New Inquiry: ${subject} from ${name}`,
          html: emailHtml
        })
      }

      // Telegram to Admin
      const telegramMsg = `
📬 <b>New Inquiry: ${subject}</b>
👤 <b>From:</b> ${name}
📧 <b>Email:</b> ${email}
📱 <b>Phone:</b> ${phone || 'N/A'}
📑 <b>Target:</b> ${targetEmail}
💬 <b>Message:</b>
<i>${message.slice(0, 150)}${message.length > 150 ? '...' : ''}</i>
      `.trim()

      await sendTelegramNotification(telegramMsg)
    } catch (e) {
      console.warn("Routing Notification Failure:", e)
    }

    return { success: true }
  } catch (error: any) {
    console.error("Contact submission failed:", error)
    return { success: false, error: error.message }
  }
}
