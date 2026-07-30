import nodemailer from "nodemailer";

export const sendOtpEmail = async (userEmail, otpCode) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  // Skip email delivery entirely if SMTP credentials are not configured
  if (!emailUser || !emailPass || emailPass.trim().length < 10) {
    console.warn(`[EMAIL SKIPPED] SMTP not configured. OTP for ${userEmail} generated but not delivered.`);
    return { success: false, reason: "not_configured" };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; border-bottom: 2px solid #6A38C2; padding-bottom: 16px; margin-bottom: 20px;">
          <h2 style="color: #6A38C2; margin: 0; font-size: 24px; font-weight: 800;">SkillSync Campus Placement Portal</h2>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Official Account &amp; Security Verification</p>
        </div>
        
        <div style="padding: 10px 0;">
          <h3 style="color: #1e293b; margin-top: 0;">Verification Required</h3>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">Use the following 6-digit OTP code to verify your email address and complete your request:</p>
          
          <div style="background-color: #F3E8FF; border: 2px dashed #6A38C2; padding: 18px; text-align: center; margin: 24px 0; border-radius: 12px;">
            <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #6A38C2;">${otpCode}</span>
          </div>

          <p style="color: #94a3b8; font-size: 12px; line-height: 1.5;">This OTP code is confidential and valid for 10 minutes. Please do not share it with anyone.</p>
        </div>

        <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
          &copy; 2026 SkillSync Campus Placement Portal. Shivangi Gupta (NIT Bhopal).
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"SkillSync Verification" <${emailUser}>`,
      to: userEmail,
      subject: `🔑 ${otpCode} is your SkillSync Verification Code`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL DELIVERED] OTP sent to: ${userEmail} | MessageID: ${info.messageId}`);

    return { success: true };
  } catch (err) {
    console.error("Email Delivery Error:", err.message);
    return { success: false, reason: "send_failed" };
  }
};
