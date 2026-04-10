'use server'

import nodemailer from 'nodemailer'

export async function submitContact(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const subject = formData.get('subject') as string
    const message = formData.get('message') as string

    // 1. Record in Supabase (Central Archive)
    const { supabase } = await import('@/lib/supabase')
    const { error: dbError } = await supabase
      .from('contact_messages')
      .insert([{ name, email, phone, subject, message, status: 'Unread' }])
    
    if (dbError) console.warn("Database save failed:", dbError)

    // 2. Dynamic Routing Logic
    const routingMap: Record<string, string> = {
      'General': 'contact@greenlegacy.in',
      'Partnership': 'partnerships@greenlegacy.in',
      'Media': 'media@greenlegacy.in',
      'Campus': 'campus@greenlegacy.in',
      'Support': 'contact@greenlegacy.in'
    }

    const targetEmail = routingMap[subject as keyof typeof routingMap] || 'contact@greenlegacy.in'
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
