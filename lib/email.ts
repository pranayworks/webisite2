import nodemailer from 'nodemailer'

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("Email credentials missing. Skipping email.")
    return { success: false, error: "Credentials missing" }
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  const mailOptions = {
    from: `"Green Legacy" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log("Email sent:", info.messageId)
    return { success: true }
  } catch (error) {
    console.error("Email send failed:", error)
    return { success: false, error }
  }
}

export function generatePlantingEmailHtml(userName: string, treeCount: number, location: string, coordinates: string) {
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${coordinates}`
  
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #121410; max-width: 600px; margin: 0 auto; border: 1px solid #e3e3db; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #121410; padding: 40px 20px; text-align: center;">
        <h1 style="color: #b2f432; font-style: italic; margin: 0;">Green Legacy</h1>
        <p style="color: #c2caaf; text-transform: uppercase; letter-spacing: 2px; font-size: 10px; margin-top: 10px;">Your Legacy is Established</p>
      </div>
      <div style="padding: 40px 30px;">
        <h2 style="font-size: 24px;">Welcome back, ${userName}</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #424935;">
          Your recent contribution of <strong>${treeCount} trees</strong> has been physically established in our stewardship forest. 
          Your impact is now grounded in the earth.
        </p>
        
        <div style="background-color: #f8faf5; border-radius: 8px; padding: 20px; margin: 30px 0; border: 1px solid #e3e3db;">
          <h3 style="margin-top: 0; font-size: 18px; color: #233600;">📍 Geo-Tagging Details</h3>
          <p style="margin: 5px 0; border: 14px;"><strong>Location:</strong> ${location}</p>
          <p style="margin: 5px 0;"><strong>Coordinates:</strong> ${coordinates}</p>
          <div style="margin-top: 20px;">
            <a href="${mapLink}" style="background-color: #b2f432; color: #233600; padding: 12px 24px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 14px; text-transform: uppercase; display: inline-block;">View on Google Maps</a>
          </div>
        </div>
        
        <p style="font-size: 14px; color: #c2caaf;">
          You can track this tree and the rest of your digital arboretum by logging into your <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" style="color: #b2f432;">Stewardship Dashboard</a>.
        </p>
      </div>
      <div style="background-color: #f8faf5; padding: 20px; text-align: center; border-top: 1px solid #e3e3db;">
        <p style="font-size: 10px; color: #c2caaf; text-transform: uppercase; letter-spacing: 1px;">© 2026 Green Legacy • Dedicated to a Greener Future</p>
      </div>
    </div>
  `
}
