import { sendEmail } from "@/lib/email"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const result = await sendEmail({
      to: process.env.ADMIN_EMAIL || "test@test.com",
      subject: "🛡️ Green Legacy System Test",
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #b2f432; border-radius: 12px; background: #fafaf9;">
          <h2 style="color: #233600;">Email Diagnostic Successful</h2>
          <p>This is a test to verify that your Vercel instance can communicate with the Gmail SMTP server.</p>
          <p><b>Time of Test:</b> ${new Date().toLocaleString()}</p>
          <p>If you are seeing this, your <code>EMAIL_USER</code> and <code>EMAIL_PASS</code> are correctly configured in Vercel.</p>
        </div>
      `
    })

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, error: result.error })
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message })
  }
}
