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

export function generateOrderConfirmationEmailHtml(userName: string, treeCount: number, planName: string) {
  return `
    <div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #f9fafb; padding: 60px 20px; color: #1a1c18;">
      <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 24px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 30px;">
           <div style="display: inline-block; background: #b2f432; color: #233600; padding: 8px 16px; border-radius: 50px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Order Confirmed</div>
        </div>
        
        <h1 style="font-size: 28px; font-weight: 800; text-align: center; margin: 0 0 10px 0; color: #121410;">Your botanical legacy has begun.</h1>
        <p style="text-align: center; color: #424935; font-size: 16px; line-height: 1.6; margin-bottom: 40px;">
          Thank you, ${userName}. Your contribution of <b>${treeCount} trees</b> (${planName}) is now in our planting queue.
        </p>

        <div style="background: #f8faf5; border-radius: 20px; padding: 30px; margin-bottom: 40px; border: 1px solid rgba(66,73,53,0.05);">
          <h3 style="margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #233600;">📋 Fulfillment Timeline</h3>
          <ul style="padding: 0; margin: 0; list-style: none; font-size: 14px; color: #424935; line-height: 2;">
            <li style="display: flex; align-items: center; gap: 10px;">✅ Payment Verified</li>
            <li style="display: flex; align-items: center; gap: 10px;">⏳ Site Allocation (In Progress)</li>
            <li style="display: flex; align-items: center; gap: 10px;">⏳ <b>GPS Coordinates (Updated within 7 days)</b></li>
          </ul>
        </div>

        <p style="text-align: center; font-size: 14px; color: #c2caaf; margin-bottom: 30px;">
          You can track the live status of your grove at any time via your dashboard.
        </p>

        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" style="display: inline-block; background-color: #121410; color: #b2f432; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">View My Dashboard</a>
        </div>
      </div>
      <p style="text-align: center; font-size: 10px; color: #c2caaf; margin-top: 30px; text-transform: uppercase; letter-spacing: 1px;">© 2026 Arboretum Management Portal • Professional Stewardship</p>
    </div>
  `
}

export function generatePlantingEmailHtml(userName: string, treeCount: number, location: string, coordinates: string) {
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${coordinates}`
  return `
    <div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #121410; padding: 60px 20px; color: #e3e3db;">
      <div style="max-width: 500px; margin: 0 auto; background: #1a1c18; border-radius: 32px; padding: 40px; border: 1px solid rgba(178,244,50,0.1);">
        <h2 style="color: #b2f432; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 10px;">Official Verification</h2>
        <h1 style="font-size: 32px; font-weight: 800; margin: 0 0 20px 0;">The earth has accepted your gift.</h1>
        
        <p style="font-size: 16px; line-height: 1.6; color: #c2caaf; margin-bottom: 30px;">
          We are proud to confirm that your <b>${treeCount} trees</b> are now physically rooted at <b>${location}</b>.
        </p>

        <div style="background: rgba(178,244,50,0.05); border-radius: 20px; padding: 24px; margin-bottom: 30px; border: 1px solid rgba(178,244,50,0.2);">
          <p style="margin: 0 0 5px 0; font-size: 10px; color: #b2f432; font-weight: 800; text-transform: uppercase;">Geo-Tagging Signature</p>
          <p style="margin: 0; font-size: 18px; font-weight: 700;">${coordinates}</p>
          <div style="margin-top: 20px;">
            <a href="${mapLink}" style="color: #b2f432; text-decoration: none; font-size: 13px; font-weight: 700;">🛰️ View Satellite Imagery →</a>
          </div>
        </div>

        <p style="font-size: 12px; color: #424935; line-height: 1.6;">
          Your digital twin is now synced with the physical world. Future growth observations will be pushed to your dashboard.
        </p>
      </div>
    </div>
  `
}

export function generateInquiryEmailHtml(name: string, email: string, phone: string, subject: string, message: string) {
  return `
    <div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #f9fafb; padding: 60px 20px; color: #1a1c18;">
      <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 24px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="border-left: 4px solid #b2f432; padding-left: 20px; margin-bottom: 30px;">
          <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #c2caaf; margin: 0;">New Engagement</h2>
          <h1 style="font-size: 24px; font-weight: 800; margin: 5px 0 0 0; color: #121410;">${subject}</h1>
        </div>
        
        <div style="margin-bottom: 30px;">
          <p style="margin: 0; font-size: 12px; font-weight: bold; color: #c2caaf; text-transform: uppercase;">From Steward</p>
          <p style="margin: 5px 0; font-size: 16px; color: #121410; font-weight: 500;">${name}</p>
          <p style="margin: 0; font-size: 14px; color: #424935; opacity: 0.7;">${email} • ${phone || 'No phone'}</p>
        </div>

        <div style="background: #f8faf5; border-radius: 16px; padding: 24px; margin-bottom: 30px;">
          <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: bold; color: #b2f432; text-transform: uppercase;">Message Brief</p>
          <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #1a1c18;">${message.replace(/\n/g, '<br/>')}</p>
        </div>

        <div style="text-align: center;">
          <a href="mailto:${email}" style="display: inline-block; background-color: #121410; color: #b2f432; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Reply to Steward</a>
        </div>
      </div>
      <p style="text-align: center; font-size: 10px; color: #c2caaf; margin-top: 30px; text-transform: uppercase; letter-spacing: 1px;">© 2026 Arboretum Management Portal • Confidential Diagnostic</p>
    </div>
  `
}

export function generateGrowthUpdateEmailHtml(userName: string, note: string, photoUrl: string) {
  return `
    <div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #121410; padding: 60px 20px; color: #e3e3db;">
      <div style="max-width: 600px; margin: 0 auto; background: #1a1c18; border-radius: 32px; overflow: hidden; border: 1px solid rgba(66,73,53,0.2);">
        <img src="${photoUrl}" style="width: 100%; height: 300px; object-fit: crop;" />
        <div style="padding: 40px;">
          <p style="text-transform: uppercase; letter-spacing: 3px; font-size: 10px; font-weight: bold; color: #b2f432; margin-bottom: 10px;">Growth Milestone</p>
          <h1 style="font-size: 28px; font-weight: 800; margin: 0 0 20px 0;">Nature is taking root, ${userName}.</h1>
          <div style="border-left: 2px solid rgba(178,244,50,0.3); padding-left: 24px;">
            <p style="font-size: 16px; line-height: 1.7; color: #c2caaf; font-style: italic;">"${note}"</p>
          </div>
          <div style="margin-top: 40px; border-top: 1px solid rgba(66,73,53,0.1); pt: 40px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" style="display: inline-block; background-color: #b2f432; color: #233600; padding: 18px 36px; border-radius: 50px; text-decoration: none; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">View Full Timeline</a>
          </div>
        </div>
      </div>
    </div>
  `
}
