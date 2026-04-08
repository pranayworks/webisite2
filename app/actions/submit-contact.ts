'use server'

import nodemailer from 'nodemailer'

export async function submitContact(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const subject = formData.get('subject') as string
    const message = formData.get('message') as string

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("Email credentials missing in .env.local")
      throw new Error("Server is missing email configuration. Add EMAIL_USER and EMAIL_PASS to .env.local")
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    const mailOptions = {
        from: process.env.EMAIL_USER,
        replyTo: email,
        to: 'greenlegacy.org@gmail.com',
        subject: `Contact Form: ${subject} - ${name}`,
        html: `
          <h2>New Contact Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr />
          <h3>Message:</h3>
          <p>${message.replace(/\n/g, '<br/>')}</p>
        `
    }

    await transporter.sendMail(mailOptions)

    return { success: true }
  } catch (error: any) {
    console.error("Contact submission failed:", error)
    return { success: false, error: error.message }
  }
}
