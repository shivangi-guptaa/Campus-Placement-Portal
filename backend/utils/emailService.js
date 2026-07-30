import nodemailer from "nodemailer";

export const sendOtpEmail = async (userEmail, otpCode) => {
  try {
    let transporter;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      // Use configured Gmail / Custom SMTP
      transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS, // Gmail App Password
        },
      });
    } else {
      // Create auto test account on Ethereal Email
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; rounded-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; border-bottom: 2px solid #6A38C2; padding-bottom: 15px;">
          <h2 style="color: #6A38C2; margin: 0;">SkillSync Campus Placement Portal</h2>
          <p style="color: #666; font-size: 12px; margin-top: 5px;">Official Password Reset Verification</p>
        </div>
        
        <div style="padding: 20px 0;">
          <h3 style="color: #333;">Password Reset Request</h3>
          <p style="color: #555; font-size: 14px;">We received a request to reset your SkillSync account password. Use the following 6-digit OTP code to complete your password reset:</p>
          
          <div style="background-color: #F3E8FF; border: 1px dashed #6A38C2; padding: 15px; text-align: center; margin: 20px 0; border-radius: 10px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #6A38C2;">${otpCode}</span>
          </div>

          <p style="color: #777; font-size: 12px;">This OTP is valid for 10 minutes. If you did not request a password reset, please ignore this email.</p>
        </div>

        <div style="border-top: 1px solid #eeeeee; padding-top: 15px; text-align: center; color: #999; font-size: 11px;">
          &copy; 2026 SkillSync Campus Placement Portal. Shivangi Gupta (NIT Bhopal).
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"SkillSync Placement Portal" <${process.env.EMAIL_USER || "no-reply@skillsync.edu"}>`,
      to: userEmail,
      subject: `🔑 ${otpCode} is your SkillSync Account Password Reset OTP`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SENT SUCCESS] OTP sent to: ${userEmail} | Message ID: ${info.messageId}`);
    
    // If using Ethereal test account, print live preview URL in terminal
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[EMAIL TEST PREVIEW LINK]: ${previewUrl}`);
    }

    return true;
  } catch (err) {
    console.error("Failed to send OTP Email:", err);
    return false;
  }
};
