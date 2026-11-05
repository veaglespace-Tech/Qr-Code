const nodemailer = require('nodemailer');

/**
 * Configure Nodemailer transporter
 */
let transporter = null;

const OLD_REVOKED_PASS = 'olkpfpodnlrsnkdi';

function getCredentials() {
  const user = (process.env.EMAIL || process.env.SMTP_USER || 'abhijeet.veaglespace@gmail.com').trim();
  let pass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || '').replace(/\s+/g, '').trim();

  // If live VPS has the old revoked password or missing password, automatically use the latest verified app password
  if (!pass || pass === OLD_REVOKED_PASS) {
    pass = 'rwosudnjkiptbtmk';
  }
  return { user, pass };
}

function getTransporter() {
  const { user, pass } = getCredentials();

  if (!user || !pass) {
    return null;
  }

  // Reuse existing transporter if credentials haven't changed
  if (transporter && transporter._user === user && transporter._pass === pass) {
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true, // SSL
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  });

  transporter._user = user;
  transporter._pass = pass;
  return transporter;
}

/**
 * Helper to dispatch email safely with automatic Port 465 -> Port 587 fallback
 */
async function sendMailSafe({ to, subject, html, text }) {
  const { user, pass } = getCredentials();
  const fromAddress = `"ReviewXpress" <${user || 'info@veaglespace.com'}>`;

  if (!user || !pass) {
    console.warn(`⚠️ [MAIL FALLBACK - SMTP NOT CONFIGURED] EMAIL or EMAIL_PASS missing! Subject: "${subject}" to: ${to}`);
    return { delivered: false, error: 'SMTP credentials (EMAIL / EMAIL_PASS) missing' };
  }

  const mailTransporter = getTransporter();

  // Attempt 1: Port 465 SSL
  try {
    const info = await mailTransporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
      text: text || ''
    });
    console.log(`✅ [EMAIL SENT SUCCESSFULLY] to ${to} | Subject: "${subject}" | ID: ${info.messageId}`);
    return { delivered: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ [EMAIL ATTEMPT 1 FAILED] to ${to}: ${err.message}. Retrying via port 587 STARTTLS...`);
    transporter = null;

    // Attempt 2: Port 587 STARTTLS fallback (in case port 465 is blocked by VPS host)
    try {
      const fallbackTransporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // STARTTLS
        auth: {
          user,
          pass
        },
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000
      });

      const info2 = await fallbackTransporter.sendMail({
        from: fromAddress,
        to,
        subject,
        html,
        text: text || ''
      });
      console.log(`✅ [EMAIL SENT ON FALLBACK PORT 587] to ${to} | Subject: "${subject}" | ID: ${info2.messageId}`);
      return { delivered: true, messageId: info2.messageId };
    } catch (err2) {
      console.error(`❌ [EMAIL ATTEMPT 2 FAILED] to ${to}: ${err2.message}`);
      return { delivered: false, error: err2.message || err.message };
    }
  }
}

/**
 * Common HTML wrapper with ReviewXpress branding
 */
function wrapHtml(title, badge, bodyContent) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
        .logo-box { text-align: center; margin-bottom: 24px; }
        .brand { font-size: 24px; font-weight: 900; color: #7c3aed; letter-spacing: -0.5px; }
        .brand span { color: #0f172a; }
        .tagline { font-size: 11px; color: #94a3b8; margin: 4px 0 0 0; font-weight: 600; }
        .badge { display: inline-block; background: #f3e8ff; color: #6b21a8; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px; text-transform: uppercase; }
        .badge-emerald { background: #d1fae5; color: #065f46; }
        .badge-amber { background: #fef3c7; color: #92400e; }
        .badge-blue { background: #dbeafe; color: #1e40af; }
        h2 { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0; }
        p { font-size: 14px; line-height: 1.6; color: #475569; margin: 12px 0; }
        .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin: 20px 0; }
        .highlight-box { background: #faf5ff; border: 2px dashed #c084fc; border-radius: 14px; padding: 18px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #6b21a8; font-family: monospace; }
        .table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
        .table th { text-align: left; padding: 8px; color: #64748b; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
        .table td { padding: 10px 8px; border-bottom: 1px solid #f1f5f9; color: #334155; }
        .btn { display: inline-block; background: #7c3aed; color: #ffffff !important; text-decoration: none; font-weight: bold; font-size: 13px; padding: 12px 24px; border-radius: 12px; margin-top: 16px; text-align: center; }
        .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 28px; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo-box">
          <div class="brand">Review<span>Xpress</span></div>
          <p class="tagline">India's #1 Smart NFC & QR Google Review Hardware</p>
        </div>
        <div style="text-align: center;">
          ${badge ? `<span class="badge ${badge.className || ''}">${badge.text}</span>` : ''}
          <h2>${title}</h2>
        </div>
        ${bodyContent}
        <div class="footer">
          &copy; ${new Date().getFullYear()} Veagle Space Technology Pvt. Ltd. &bull; ReviewXpress India<br>
          Kudale Patil Tower, Vadgaon Budruk, Pune, Maharashtra 411041
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * 1. Send 6-Digit Verification OTP (Partner Registration or Password Reset)
 */
async function sendVerificationEmail(toEmail, otp, name = 'Valued User', purpose = 'Password Reset') {
  if (typeof toEmail === 'object' && toEmail !== null) {
    const opts = toEmail;
    return sendVerificationEmail(opts.to || opts.email, opts.otp, opts.name || 'Valued User', opts.purpose || opts.type || 'Password Reset');
  }

  const purposeStr = (purpose || '').toString();
  const isPartner = purposeStr.toLowerCase().includes('partner') || purposeStr.toLowerCase().includes('registration');
  const isReset = purposeStr.toLowerCase().includes('reset') || purposeStr.toLowerCase().includes('forgot');
  const isSuperadmin = purposeStr.toLowerCase().includes('superadmin');

  let title = 'Security Verification';
  let badgeText = 'SECURITY VERIFICATION';
  let badgeClass = '';
  let introMessage = 'Please enter the following 6-digit verification code:';
  let emailSubject = `[${otp}] Your ReviewXpress Security Verification Code`;

  if (isSuperadmin) {
    title = 'Superadmin Console Access OTP';
    badgeText = 'SUPERADMIN 2FA';
    badgeClass = '';
    introMessage = 'A Superadmin login session was requested for your ReviewXpress Master Administrative Console. Enter the high-security verification code below to authorize your session:';
    emailSubject = `[${otp}] Superadmin Login OTP - ReviewXpress`;
  } else if (isPartner) {
    title = 'Verify Your Partner Email Address';
    badgeText = 'PARTNER VERIFICATION';
    introMessage = 'Thank you for registering as an Official Organization Partner with ReviewXpress. To ensure account security and activate your commission dashboard, enter the code below:';
    emailSubject = `[${otp}] Verify Your ReviewXpress Partner Email Address`;
  } else if (isReset) {
    title = 'Reset Your ReviewXpress Password';
    badgeText = 'PASSWORD RESET';
    badgeClass = 'badge-amber';
    introMessage = 'We received a request to reset your ReviewXpress account password. Enter the 6-digit verification code below to set your new password:';
    emailSubject = `[${otp}] Reset Your ReviewXpress Account Password`;
  }

  const content = `
    <p>Hello <strong>${name}</strong>,</p>
    <p>${introMessage}</p>
    <div class="highlight-box">
      <div style="font-size: 11px; font-weight: 700; color: #9333ea; text-transform: uppercase; margin-bottom: 6px;">Your 6-Digit Verification Code</div>
      <div class="otp-code">${otp}</div>
      <div style="font-size: 11px; color: #a855f7; margin-top: 6px;">Valid for 10 minutes</div>
    </div>
    <p style="font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 14px;">
      🛡️ If you did not request this code, please ignore this email. Never share this code with anyone.
    </p>
  `;

  console.log(`🔑 [SECURITY OTP GENERATED] For ${toEmail}: [${otp}] (Purpose: ${purpose})`);
  const html = wrapHtml(title, { text: badgeText, className: badgeClass }, content);
  return sendMailSafe({ to: toEmail, subject: emailSubject, html });
}

/**
 * 2. Send Order Confirmation Email to Customer
 */
async function sendOrderConfirmationEmail(order, items = []) {
  if (!order || !order.customerEmail) return { delivered: false };

  const parsedItems = items.length ? items : (order.items ? (typeof order.items === 'string' ? JSON.parse(order.items) : order.items) : []);
  const isCOD = (order.paymentMethod || '').toLowerCase().includes('cod');
  const paymentBadge = isCOD ? 'Cash on Delivery (COD)' : 'Paid Online (PayU)';

  const itemsRows = parsedItems.map(item => `
    <tr>
      <td><strong>${item.title || 'Smart Review Stand'}</strong></td>
      <td style="text-align: center;">${item.quantity || 1}</td>
      <td style="text-align: right;">₹${item.price || item.total}</td>
    </tr>
  `).join('');

  const content = `
    <p>Dear <strong>${order.customerName || 'Customer'}</strong>,</p>
    <p>Thank you for choosing ReviewXpress! Your order has been placed successfully and our technical lab has queued your custom stand for laser printing & NFC encoding.</p>

    <div class="info-box">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="color: #64748b; font-size: 12px;">Order Number:</span>
        <strong style="color: #7c3aed; font-family: monospace;">${order.orderNumber}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="color: #64748b; font-size: 12px;">Payment Method:</span>
        <strong>${paymentBadge}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="color: #64748b; font-size: 12px;">Customized For:</span>
        <strong>${order.businessName || order.customerName}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="color: #64748b; font-size: 12px;">Shipping Address:</span>
        <span style="font-size: 12px; text-align: right; max-width: 60%;">${order.address || ''}, ${order.city || ''} ${order.pincode || ''}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid #e2e8f0;">
        <span style="color: #64748b; font-size: 12px;">Total Amount:</span>
        <strong style="font-size: 16px; color: #0f172a;">₹${order.finalAmount}</strong>
      </div>
    </div>

    <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 20px;">Order Items</h3>
    <table class="table">
      <thead>
        <tr>
          <th>Product</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div class="info-box" style="background: #faf5ff; border-color: #e9d5ff; margin-top: 20px;">
      <strong style="color: #6b21a8; font-size: 12px; display: block; margin-bottom: 4px;">📱 Track & Manage Your Order</strong>
      <p style="font-size: 12px; color: #475569; margin: 0;">
        You can track dispatch status, courier AWB, and download your GST Tax Invoice anytime by signing into your ReviewXpress account using your email/mobile.
        <br><em>Default password:</em> <strong style="font-family: monospace;">ReviewXpress@123</strong> (or use Forgot Password to reset).
      </p>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/user/dashboard" class="btn">View Customer Dashboard & Invoice &rarr;</a>
    </div>
  `;

  const html = wrapHtml(`Order Confirmed: #${order.orderNumber}`, { text: 'ORDER CONFIRMED', className: 'badge-emerald' }, content);
  return sendMailSafe({
    to: order.customerEmail,
    subject: `[Order Confirmed: #${order.orderNumber}] ReviewXpress Smart Stand Confirmation`,
    html
  });
}

/**
 * 3. Send New Order Alert to Superadmin / Operations Team
 */
async function sendNewOrderAdminAlert(orderOrOptions, items = []) {
  const order = (orderOrOptions && orderOrOptions.order) ? orderOrOptions.order : orderOrOptions;
  const adminEmail = (orderOrOptions && orderOrOptions.adminEmail) || process.env.ADMIN_ALERT_EMAIL || process.env.EMAIL || 'info@veaglespace.com';
  if (!adminEmail || !order) return { delivered: false };

  const parsedItems = items.length ? items : (order.items ? (typeof order.items === 'string' ? JSON.parse(order.items) : order.items) : []);
  const isCOD = (order.paymentMethod || '').toLowerCase().includes('cod');

  const content = `
    <p>A new customer order has been placed on ReviewXpress!</p>
    <div class="info-box">
      <p style="margin: 4px 0;"><strong>Order:</strong> #${order.orderNumber} (₹${order.finalAmount})</p>
      <p style="margin: 4px 0;"><strong>Customer:</strong> ${order.customerName} (${order.customerPhone})</p>
      <p style="margin: 4px 0;"><strong>Email:</strong> ${order.customerEmail}</p>
      <p style="margin: 4px 0;"><strong>Business to Print:</strong> <strong style="color: #7c3aed;">${order.businessName || 'N/A'}</strong></p>
      <p style="margin: 4px 0;"><strong>Google Review Link:</strong> ${order.googleReviewLink ? `<a href="${order.googleReviewLink}">${order.googleReviewLink}</a>` : 'N/A'}</p>
      <p style="margin: 4px 0;"><strong>Payment Method:</strong> ${isCOD ? 'Cash on Delivery (Pending)' : 'Paid Online (PayU)'}</p>
      <p style="margin: 4px 0;"><strong>Shipping Destination:</strong> ${order.address}, ${order.city} - ${order.pincode}</p>
      ${order.adminReferralId ? `<p style="margin: 4px 0; color: #9333ea;"><strong>Partner Referral:</strong> Linked to Partner ID #${order.adminReferralId}</p>` : ''}
    </div>
    <div style="text-align: center; margin-top: 20px;">
      <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/superadmin/dashboard" class="btn">Open Superadmin Orders &rarr;</a>
    </div>
  `;

  const html = wrapHtml(`New Order Alert: #${order.orderNumber}`, { text: 'NEW ORDER RECEIVED', className: 'badge-emerald' }, content);
  return sendMailSafe({
    to: adminEmail,
    subject: `🔔 [New Order: #${order.orderNumber}] ₹${order.finalAmount} from ${order.customerName}`,
    html
  });
}

/**
 * 4. Send Partner Commission Notification Email
 */
async function sendPartnerCommissionAlert(partnerOrOptions, order, commissionAmount) {
  let partner = partnerOrOptions;
  let orderData = order;
  let commAmt = commissionAmount;

  if (partnerOrOptions && partnerOrOptions.partnerEmail) {
    partner = {
      email: partnerOrOptions.partnerEmail,
      name: partnerOrOptions.partnerName || 'Partner',
      commissionPercent: partnerOrOptions.commissionPercent || 15
    };
    orderData = {
      orderNumber: partnerOrOptions.orderNumber || 'RX-ORDER',
      businessName: partnerOrOptions.customerName || 'Customer',
      customerName: partnerOrOptions.customerName || 'Customer',
      finalAmount: partnerOrOptions.orderSubtotal || partnerOrOptions.amount || 0,
      paymentMethod: 'Online'
    };
    commAmt = partnerOrOptions.commissionAmount;
  }

  if (!partner || !partner.email || !commAmt) return { delivered: false };

  const content = `
    <p>Hello <strong>${partner.name || 'Partner'}</strong>,</p>
    <p>Great news! A new order was just placed through your exclusive ReviewXpress partner referral.</p>

    <div class="highlight-box" style="background: #ecfdf5; border-color: #6ee7b7;">
      <div style="font-size: 11px; font-weight: 700; color: #047857; text-transform: uppercase; margin-bottom: 4px;">Commission Earned</div>
      <div style="font-size: 32px; font-weight: 900; color: #065f46;">+₹${commAmt}</div>
      <div style="font-size: 12px; color: #047857; margin-top: 4px;">Linked with Order #${orderData.orderNumber}</div>
    </div>

    <div class="info-box">
      <p style="margin: 4px 0;"><strong>Customer / Business:</strong> ${orderData.businessName || orderData.customerName}</p>
      <p style="margin: 4px 0;"><strong>Order Amount:</strong> ₹${orderData.finalAmount}</p>
      <p style="margin: 4px 0;"><strong>Commission Share:</strong> ${partner.commissionPercent || 15}%</p>
      <p style="margin: 4px 0;"><strong>Commission Status:</strong> ${orderData.paymentMethod === 'cod' ? 'Credited upon delivery' : 'Approved'}</p>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/dashboard" class="btn">Check Partner Earnings &rarr;</a>
    </div>
  `;

  const html = wrapHtml('Congratulations! New Commission Earned', { text: 'PARTNER COMMISSION', className: 'badge-emerald' }, content);
  return sendMailSafe({
    to: partner.email,
    subject: `🎉 [Commission Earned] You earned ₹${commAmt} on Order #${orderData.orderNumber}`,
    html
  });
}

/**
 * 5. Send Partner Payout Request Submitted Emails
 */
async function sendPayoutRequestEmails(partnerOrOptions, payout) {
  let partner = partnerOrOptions;
  let payoutData = payout;

  if (partnerOrOptions && partnerOrOptions.partnerEmail) {
    partner = {
      email: partnerOrOptions.partnerEmail,
      name: partnerOrOptions.partnerName || 'Partner',
      orgName: partnerOrOptions.orgName || 'Partner Store',
      phone: partnerOrOptions.phone,
      bankHolder: partnerOrOptions.bankHolder,
      bankAccount: partnerOrOptions.bankAccount,
      ifscCode: partnerOrOptions.ifscCode,
      upiId: partnerOrOptions.upiId
    };
    payoutData = {
      id: partnerOrOptions.payoutId || 1,
      amount: partnerOrOptions.amount,
      method: partnerOrOptions.method || 'UPI / Bank'
    };
  }

  if (!partner || !payoutData) return { delivered: false };

  // 1. Partner acknowledgement
  const partnerContent = `
    <p>Hello <strong>${partner.name || 'Partner'}</strong>,</p>
    <p>Your payout withdrawal request for <strong>₹${payoutData.amount}</strong> has been received by ReviewXpress Accounts Team.</p>
    <div class="info-box">
      <p style="margin: 4px 0;"><strong>Payout ID:</strong> #${payoutData.id}</p>
      <p style="margin: 4px 0;"><strong>Requested Amount:</strong> ₹${payoutData.amount}</p>
      <p style="margin: 4px 0;"><strong>Transfer Method:</strong> ${payoutData.method || 'Bank Transfer / UPI'}</p>
      <p style="margin: 4px 0;"><strong>Status:</strong> Under Review (Usually processed within 24-48 hours)</p>
    </div>
    <p style="font-size: 13px; color: #64748b;">We will notify you immediately once the funds are transferred to your registered account.</p>
  `;
  const partnerHtml = wrapHtml('Payout Request Submitted', { text: 'PAYOUT REQUESTED', className: 'badge-blue' }, partnerContent);
  await sendMailSafe({
    to: partner.email,
    subject: `[Payout Request Submitted: #${payoutData.id}] ₹${payoutData.amount} Under Review`,
    html: partnerHtml
  });

  // 2. Superadmin alert
  const adminEmail = process.env.ADMIN_ALERT_EMAIL || process.env.EMAIL;
  if (adminEmail) {
    const adminContent = `
      <p>Partner <strong>${partner.name}</strong> (${partner.orgName || 'Partner'}) has submitted a payout request.</p>
      <div class="info-box">
        <p style="margin: 4px 0;"><strong>Amount:</strong> ₹${payoutData.amount}</p>
        <p style="margin: 4px 0;"><strong>Partner:</strong> ${partner.name} (${partner.email})</p>
        <p style="margin: 4px 0;"><strong>Phone:</strong> ${partner.phone || 'N/A'}</p>
        <p style="margin: 4px 0;"><strong>Bank Holder:</strong> ${partner.bankHolder || 'N/A'}</p>
        <p style="margin: 4px 0;"><strong>Bank Account:</strong> ${partner.bankAccount || 'N/A'}</p>
        <p style="margin: 4px 0;"><strong>IFSC Code:</strong> ${partner.ifscCode || 'N/A'}</p>
        <p style="margin: 4px 0;"><strong>UPI ID:</strong> ${partner.upiId || 'N/A'}</p>
      </div>
      <div style="text-align: center; margin-top: 20px;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/superadmin/dashboard" class="btn">Review & Process Payout &rarr;</a>
      </div>
    `;
    const adminHtml = wrapHtml('New Partner Payout Request', { text: 'ACTION REQUIRED', className: 'badge-amber' }, adminContent);
    await sendMailSafe({
      to: adminEmail,
      subject: `🔔 [Payout Request] ₹${payoutData.amount} requested by ${partner.name}`,
      html: adminHtml
    });
  }

  return { delivered: true };
}

/**
 * 6. Send Payout Status Update Email (Approved / Paid vs Rejected)
 */
async function sendPayoutStatusUpdateEmail(partnerOrOptions, payout) {
  let partner = partnerOrOptions;
  let payoutData = payout;

  if (partnerOrOptions && partnerOrOptions.partnerEmail) {
    partner = {
      email: partnerOrOptions.partnerEmail,
      name: partnerOrOptions.partnerName || 'Partner'
    };
    payoutData = {
      amount: partnerOrOptions.amount,
      status: partnerOrOptions.status || 'PAID',
      transactionRef: partnerOrOptions.transactionRef,
      remarks: partnerOrOptions.remarks
    };
  }

  if (!partner || !partner.email || !payoutData) return { delivered: false };

  const isPaid = (payoutData.status || '').toLowerCase() === 'paid';

  let title = isPaid ? 'Payout Processed Successfully' : 'Payout Request Update';
  let badgeText = isPaid ? 'PAYOUT PROCESSED' : 'PAYOUT REJECTED';
  let badgeClass = isPaid ? 'badge-emerald' : 'badge-amber';

  const content = `
    <p>Hello <strong>${partner.name || 'Partner'}</strong>,</p>
    ${isPaid ? `
      <p>Your payout request for <strong>₹${payoutData.amount}</strong> has been approved and processed successfully by ReviewXpress Accounts Team!</p>
      <div class="highlight-box" style="background: #ecfdf5; border-color: #6ee7b7;">
        <div style="font-size: 11px; font-weight: 700; color: #047857; text-transform: uppercase;">Amount Transferred</div>
        <div style="font-size: 32px; font-weight: 900; color: #065f46;">₹${payoutData.amount}</div>
        ${payoutData.transactionRef ? `<div style="font-size: 12px; color: #047857; margin-top: 4px; font-family: monospace;">Ref: ${payoutData.transactionRef}</div>` : ''}
      </div>
      <p style="font-size: 13px; color: #475569;">The funds should reflect in your registered bank/UPI account according to bank clearance timelines.</p>
    ` : `
      <p>We are writing to inform you that your payout request for <strong>₹${payoutData.amount}</strong> could not be processed at this time.</p>
      <div class="info-box" style="border-left: 4px solid #f59e0b;">
        <p style="margin: 0; color: #92400e;"><strong>Remarks / Reason:</strong> ${payoutData.remarks || 'Please check your bank/UPI details or contact support.'}</p>
      </div>
      <p style="font-size: 13px; color: #475569;">The requested funds remain in your partner balance. You may update your bank details in your dashboard and submit a new request.</p>
    `}

    <div style="text-align: center; margin-top: 24px;">
      <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/dashboard" class="btn">Go to Partner Dashboard &rarr;</a>
    </div>
  `;

  const html = wrapHtml(title, { text: badgeText, className: badgeClass }, content);
  return sendMailSafe({
    to: partner.email,
    subject: isPaid
      ? `✅ [Payout Processed] ₹${payoutData.amount} sent to your account`
      : `⚠️ [Payout Update] Notice regarding your ₹${payoutData.amount} withdrawal request`,
    html
  });
}

/**
 * 7. Send Contact Support Inquiry Emails
 */
async function sendContactInquiryEmails({ name, email, phone, subject, message }) {
  const adminEmail = process.env.ADMIN_ALERT_EMAIL || process.env.EMAIL || 'info@veaglespace.com';

  // 1. Alert to Support Team
  const adminContent = `
    <p>A new customer inquiry has been received through the website contact form.</p>
    <div class="info-box">
      <p style="margin: 4px 0;"><strong>Sender Name:</strong> ${name}</p>
      <p style="margin: 4px 0;"><strong>Email:</strong> ${email}</p>
      <p style="margin: 4px 0;"><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <p style="margin: 4px 0;"><strong>Subject:</strong> ${subject || 'Support Inquiry'}</p>
      <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
        <strong style="color: #64748b; font-size: 11px; text-transform: uppercase;">Message:</strong>
        <p style="margin: 6px 0; color: #0f172a; white-space: pre-wrap; font-size: 13px;">${message}</p>
      </div>
    </div>
    <div style="text-align: center; margin-top: 16px;">
      <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject || 'ReviewXpress Inquiry')}" class="btn">Reply via Email &rarr;</a>
    </div>
  `;
  const adminHtml = wrapHtml('New Contact Inquiry', { text: 'CUSTOMER INQUIRY', className: 'badge-blue' }, adminContent);
  await sendMailSafe({
    to: adminEmail,
    subject: `📩 [Inquiry] ${subject || 'New Contact Request'} from ${name}`,
    html: adminHtml
  });

  // 2. Acknowledgement to User
  if (email && email.includes('@')) {
    const userContent = `
      <p>Dear <strong>${name}</strong>,</p>
      <p>Thank you for reaching out to ReviewXpress Support! We have received your inquiry regarding <strong>"${subject || 'Smart NFC Review Stands'}"</strong>.</p>
      <div class="info-box" style="background: #f8fafc;">
        <p style="margin: 0; font-size: 13px; color: #475569;">
          Our customer support engineers review all inquiries promptly. We will respond to your query via email or call within <strong>2 to 4 business hours</strong>.
        </p>
      </div>
      <p style="font-size: 13px; color: #64748b;">
        If your request is urgent, you can also reach us directly on WhatsApp or phone at <strong style="color: #7c3aed;">+91 8237999101</strong>.
      </p>
    `;
    const userHtml = wrapHtml('We Received Your Message!', { text: 'SUPPORT ACKNOWLEDGEMENT', className: 'badge-emerald' }, userContent);
    await sendMailSafe({
      to: email,
      subject: `We received your inquiry, ${name}! — ReviewXpress Support`,
      html: userHtml
    });
  }

  return { delivered: true };
}

module.exports = {
  sendVerificationEmail,
  sendOrderConfirmationEmail,
  sendNewOrderAdminAlert,
  sendPartnerCommissionAlert,
  sendPayoutRequestEmails,
  sendPayoutStatusUpdateEmail,
  sendContactInquiryEmails
};
