const nodemailer = require('nodemailer');

/**
 * Configure Nodemailer transporter
 */
let transporter = null;

function getTransporter() {
  if (!transporter && process.env.EMAIL && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  return transporter;
}

/**
 * Send 6-Digit Verification OTP Email
 * @param {string} toEmail
 * @param {string} otp
 * @param {string} name
 * @param {string} purpose
 * @returns {Promise<{ delivered: boolean, error?: string }>}
 */
async function sendVerificationEmail(toEmail, otp, name = 'Valued User', purpose = 'Account Access') {
  const mailTransporter = getTransporter();

  const isPartner = purpose.toLowerCase().includes('partner');
  const title = isPartner ? 'Verify Your ReviewXpress Partner Email' : 'Your ReviewXpress Login Verification Code';
  const subTitle = isPartner ? 'Official Partner Program Verification' : 'Customer Account Security';
  const introMessage = isPartner
    ? 'Thank you for registering as an Official Organization Partner with ReviewXpress. To ensure security and prevent unauthorized access, please enter the following verification code:'
    : 'Use the one-time verification code below to securely sign into your ReviewXpress Customer Account:';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .logo-box { text-align: center; margin-bottom: 24px; }
        .brand { font-size: 22px; font-weight: 900; color: #7c3aed; letter-spacing: -0.5px; }
        .brand span { color: #0f172a; }
        .badge { display: inline-block; background: #f3e8ff; color: #6b21a8; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px; }
        h2 { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 0; }
        p { font-size: 14px; line-height: 1.6; color: #475569; margin: 12px 0; }
        .otp-container { background: #faf5ff; border: 2px dashed #c084fc; border-radius: 14px; padding: 18px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #6b21a8; font-family: monospace; }
        .warning { font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px; }
        .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 24px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo-box">
          <div class="brand">Review<span>Xpress</span></div>
          <p style="font-size: 11px; color: #94a3b8; margin: 4px 0 0 0;">${subTitle}</p>
        </div>
        <div style="text-align: center;">
          <span class="badge">SECURITY VERIFICATION</span>
          <h2>${isPartner ? 'Verify Your Email Address' : 'Sign In Verification Code'}</h2>
        </div>
        <p>Hello <strong>${name}</strong>,</p>
        <p>${introMessage}</p>
        
        <div class="otp-container">
          <div style="font-size: 11px; font-weight: 700; color: #9333ea; text-transform: uppercase; margin-bottom: 6px;">Your 6-Digit OTP Code</div>
          <div class="otp-code">${otp}</div>
          <div style="font-size: 11px; color: #a855f7; margin-top: 6px;">Valid for 10 minutes</div>
        </div>

        <p class="warning">
          🛡️ If you did not request this verification code, please ignore this email. Never share this code with anyone.
        </p>

        <div class="footer">
          &copy; ${new Date().getFullYear()} Veagle Space Technology Pvt. Ltd. • ReviewXpress India
        </div>
      </div>
    </body>
    </html>
  `;

  if (!mailTransporter) {
    console.warn(`[OTP FALLBACK] Nodemailer not configured. OTP for ${toEmail} is: ${otp}`);
    return { delivered: false, error: 'SMTP not configured' };
  }

  try {
    const info = await mailTransporter.sendMail({
      from: `"ReviewXpress Security" <${process.env.EMAIL}>`,
      to: toEmail,
      subject: `[${otp}] Your ReviewXpress Security Verification Code`,
      html: htmlContent
    });
    console.log(`✅ [OTP EMAIL SENT] to ${toEmail}: messageId=${info.messageId}`);
    return { delivered: true };
  } catch (err) {
    console.error(`❌ [OTP EMAIL FAILED] Could not send via Gmail SMTP: ${err.message}`);
    console.log(`👉 [DEVELOPMENT OTP LOG] Code for ${toEmail}: ${otp}`);
    return { delivered: false, error: err.message };
  }
}

module.exports = {
  sendVerificationEmail
};
