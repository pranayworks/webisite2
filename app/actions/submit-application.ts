'use server'

import { supabase } from '@/lib/supabase'
import nodemailer from 'nodemailer'

export async function submitApplication(formData: FormData) {
  try {
    const type = formData.get('type') as string
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    
    // Extract dynamic details based on form type
    const details: Record<string, any> = {}
    for (const [key, value] of Array.from(formData.entries())) {
      if (!['type', 'name', 'email', 'phone'].includes(key)) {
        details[key] = value
      }
    }

    // 1. Store in Supabase database
    const { error: dbError } = await supabase
      .from('applications')
      .insert([
        {
          type,
          name,
          email,
          phone,
          details,
          created_at: new Date().toISOString()
        }
      ])

    if (dbError) {
      console.error("Supabase insert error:", dbError)
      throw new Error("Database error: Please create an 'applications' table in Supabase.")
    }

    // 2. Send Email via Nodemailer
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      })

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'greenlegacy.org@gmail.com',
        subject: `New Application: ${type} - ${name}`,
        html: `
          <h2>New Application Received</h2>
          <p><strong>Type:</strong> ${type}</p>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <h3>Additional Details:</h3>
          <ul>
            ${Object.entries(details).map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`).join('')}
          </ul>
        `
      }

      await transporter.sendMail(mailOptions)
    } else {
       console.log("Email credentials missing in .env.local. Application saved to DB, but email was skipped.")
    }

    return { success: true }
  } catch (error: any) {
    console.error("Application submission failed:", error)
    return { success: false, error: error.message }
  }
}
