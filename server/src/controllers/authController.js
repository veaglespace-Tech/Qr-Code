const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { validateEmail } = require('../utils/emailValidator');
const { createOTP, verifyOTP, isEmailVerified, consumeEmailVerification } = require('../utils/otpStore');
const { sendVerificationEmail } = require('../utils/mailer');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_KEY || process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );
};

exports.sendPartnerOTP = asyncHandler(async (req, res) => {
  const { email, name } = req.body;

  if (!email) {
    throw new ApiError(400, 'Email address is required.');
  }

  // 1. Strict validation (RFC syntax, disposable blocklist, active DNS MX check)
  const validation = await validateEmail(email);
  if (!validation.isValid) {
    throw new ApiError(400, validation.error || 'Invalid email address.');
  }

  const cleanEmail = validation.normalizedEmail;

  // 2. Check if email is already registered
  const existing = await prisma.user.findUnique({
    where: { email: cleanEmail }
  });
  if (existing) {
    throw new ApiError(400, 'An account with this email address already exists. Please sign in.');
  }

  // 3. Generate secure 6-digit OTP
  const otpRes = createOTP(cleanEmail);
  if (!otpRes.success) {
    throw new ApiError(429, otpRes.error || 'Please wait before requesting another code.');
  }

  // 4. Send verification email via Nodemailer
  const sendRes = await sendVerificationEmail(cleanEmail, otpRes.otp, name || 'Partner');

  return res.json({
    success: true,
    message: sendRes.delivered
      ? `Verification OTP sent to ${cleanEmail}. Please check your inbox.`
      : `Verification code generated for ${cleanEmail}.`,
    // For development convenience if SMTP credentials fail
    devOtp: process.env.NODE_ENV !== 'production' ? otpRes.otp : undefined
  });
});

exports.verifyPartnerOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, 'Email address and 6-digit OTP are required.');
  }

  const cleanEmail = email.trim().toLowerCase();
  const verifyRes = verifyOTP(cleanEmail, otp);

  if (!verifyRes.success) {
    throw new ApiError(400, verifyRes.error || 'Invalid or expired verification code.');
  }

  return res.json({
    success: true,
    message: 'Email address verified successfully!'
  });
});

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role = 'USER', orgName, bankDetails, referralCodeUsed } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email and password are required');
  }

  // 1. Strict email validation for all users (RFC, disposable blocklist, MX check)
  const emailValidation = await validateEmail(email);
  if (!emailValidation.isValid) {
    throw new ApiError(400, emailValidation.error || 'Please provide a valid, active email address.');
  }
  const cleanEmail = emailValidation.normalizedEmail;

  // 2. For Partners (ADMIN role), require verified email OTP
  if (role === 'ADMIN' && !isEmailVerified(cleanEmail)) {
    throw new ApiError(400, 'Email verification required. Please verify your email with the 6-digit OTP code before submitting registration.');
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: cleanEmail }
  });

  if (existingUser) {
    // If user account was created during guest checkout, allow setting their password & logging in
    if (existingUser.role === 'USER' && role !== 'ADMIN') {
      const hashedPassword = await bcrypt.hash(password, 10);
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: name.trim() || existingUser.name,
          phone: phone || existingUser.phone,
          password: hashedPassword
        }
      });
      const token = generateToken(updatedUser);
      const { password: _, ...safeUser } = updatedUser;

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.status(200).json({
        success: true,
        user: safeUser,
        token,
        message: 'Account password set and logged in successfully!'
      });
    }

    throw new ApiError(400, 'An account with this email already exists. Please sign in or use OTP login.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const settings = await prisma.setting.findFirst();

  let referredById = null;
  if (referralCodeUsed) {
    const partner = await prisma.user.findFirst({
      where: {
        role: 'ADMIN',
        referralCode: referralCodeUsed.trim().toUpperCase()
      }
    });
    if (partner) {
      referredById = partner.id;
    }
  }

  // Role setup
  let assignedRole = role === 'ADMIN' ? 'ADMIN' : 'USER';
  let referralCode = null;
  let commissionPercent = null;

  if (assignedRole === 'ADMIN') {
    const cleanPrefix = (orgName || name).replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toUpperCase();
    referralCode = `${cleanPrefix}${Math.floor(100 + Math.random() * 900)}`;
    commissionPercent = settings ? settings.defaultCommissionPercent : 15.0;
  }

  const newUser = await prisma.user.create({
    data: {
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      phone: phone || '',
      role: assignedRole,
      orgName: orgName || (assignedRole === 'ADMIN' ? name : null),
      referralCode,
      commissionPercent,
      bankHolder: bankDetails?.bankHolder || '',
      bankAccount: bankDetails?.bankAccount || '',
      bankName: bankDetails?.bankName || '',
      ifscCode: bankDetails?.ifscCode || '',
      upiId: bankDetails?.upiId || '',
      referredById
    }
  });

  if (assignedRole === 'ADMIN') {
    consumeEmailVerification(cleanEmail);
  }

  const token = generateToken(newUser);
  const { password: _, ...safeUser } = newUser;

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return res.status(201).json({
    success: true,
    user: safeUser,
    token,
    message: assignedRole === 'ADMIN'
      ? 'Organization registered successfully! Welcome to the Partner Program.'
      : 'Account created successfully!'
  });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { identifier } = req.body;

  if (!identifier) {
    throw new ApiError(400, 'Please enter your registered email address or mobile number.');
  }

  const cleanInput = identifier.trim();
  const cleanDigits = cleanInput.replace(/\D/g, '');

  let user = null;
  if (cleanInput.includes('@')) {
    user = await prisma.user.findUnique({
      where: { email: cleanInput.toLowerCase() }
    });
  } else if (cleanDigits.length >= 10) {
    const last10 = cleanDigits.slice(-10);
    user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: cleanInput },
          { phone: cleanDigits },
          { phone: { endsWith: last10 } }
        ]
      }
    });
  } else {
    user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanInput.toLowerCase() },
          { phone: cleanInput }
        ]
      }
    });
  }

  if (!user) {
    throw new ApiError(404, 'No account found with this email address or mobile number.');
  }

  if (user.status === 'inactive') {
    throw new ApiError(403, 'Your account is deactivated. Please contact support.');
  }

  // Generate 6-digit OTP using the user's email as key
  const otpRes = createOTP(user.email);
  if (!otpRes.success) {
    throw new ApiError(429, otpRes.error || 'Please wait before requesting another reset code.');
  }

  // Send Password Reset email
  const sendRes = await sendVerificationEmail(user.email, otpRes.otp, user.name || 'Valued User', 'Password Reset');

  // Mask email for privacy (e.g., ro***@gmail.com)
  const [uname, domain] = user.email.split('@');
  const maskedEmail = (uname.length > 2 ? uname.slice(0, 2) + '***' : uname + '***') + '@' + domain;

  return res.json({
    success: true,
    email: user.email,
    maskedEmail,
    message: sendRes.delivered
      ? `A 6-digit password reset code has been sent to ${maskedEmail}.`
      : `Password reset code generated for ${maskedEmail}.`,
    devOtp: process.env.NODE_ENV !== 'production' ? otpRes.otp : undefined
  });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    throw new ApiError(400, 'Email address, 6-digit reset code, and new password are required.');
  }

  if (newPassword.trim().length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters long.');
  }

  const cleanEmail = email.trim().toLowerCase();
  const verifyRes = verifyOTP(cleanEmail, otp);

  if (!verifyRes.success) {
    throw new ApiError(400, verifyRes.error || 'Invalid or expired password reset code.');
  }

  const user = await prisma.user.findUnique({
    where: { email: cleanEmail }
  });

  if (!user) {
    throw new ApiError(404, 'User account not found.');
  }

  if (user.status === 'inactive') {
    throw new ApiError(403, 'Your account is deactivated. Please contact support.');
  }

  // Hash new password and update in database
  const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword }
  });

  // Invalidate OTP code so it cannot be used again
  consumeEmailVerification(cleanEmail);

  return res.status(200).json({
    success: true,
    message: 'Your password has been reset successfully! You can now sign in with your new password.'
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email or Mobile and password are required');
  }

  const cleanInput = email.trim();
  const cleanDigits = cleanInput.replace(/\D/g, '');

  let user = null;
  if (cleanInput.includes('@')) {
    user = await prisma.user.findUnique({
      where: { email: cleanInput.toLowerCase() }
    });
  } else if (cleanDigits.length >= 10) {
    const last10 = cleanDigits.slice(-10);
    user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: cleanInput },
          { phone: cleanDigits },
          { phone: { endsWith: last10 } }
        ]
      }
    });
  } else {
    user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanInput.toLowerCase() },
          { phone: cleanInput }
        ]
      }
    });
  }

  if (!user) {
    throw new ApiError(401, 'Invalid email/mobile or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    if (user.role === 'USER') {
      throw new ApiError(
        401,
        'Incorrect password. If you forgot your password, please click "Forgot Password?" to reset it.'
      );
    }
    throw new ApiError(401, 'Invalid email or password');
  }

  if (user.status === 'inactive') {
    throw new ApiError(403, 'Your account is deactivated. Please contact support.');
  }

  const token = generateToken(user);
  const { password: _, ...safeUser } = user;

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return res.json({
    success: true,
    user: safeUser,
    token,
    message: `Welcome back, ${user.name}!`
  });
});

exports.getMe = asyncHandler(async (req, res) => {
  return res.json({ success: true, user: req.user || null });
});

exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  return res.json({ success: true, message: 'Logged out successfully' });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    name,
    phone,
    orgName,
    bankHolder,
    bankAccount,
    bankName,
    ifscCode,
    upiId,
    currentPassword,
    newPassword
  } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new ApiError(404, 'User account not found');
  }

  const updateData = {};

  if (name !== undefined && name.trim()) {
    updateData.name = name.trim();
  }
  if (phone !== undefined) {
    updateData.phone = phone ? phone.trim() : null;
  }
  if (orgName !== undefined) {
    updateData.orgName = orgName ? orgName.trim() : null;
  }
  if (bankHolder !== undefined) {
    updateData.bankHolder = bankHolder ? bankHolder.trim() : null;
  }
  if (bankAccount !== undefined) {
    updateData.bankAccount = bankAccount ? bankAccount.trim() : null;
  }
  if (bankName !== undefined) {
    updateData.bankName = bankName ? bankName.trim() : null;
  }
  if (ifscCode !== undefined) {
    updateData.ifscCode = ifscCode ? ifscCode.trim().toUpperCase() : null;
  }
  if (upiId !== undefined) {
    updateData.upiId = upiId ? upiId.trim() : null;
  }

  // Handle password change
  if (newPassword && newPassword.trim()) {
    if (!currentPassword) {
      throw new ApiError(400, 'Current password is required to change your password');
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new ApiError(400, 'Current password is incorrect');
    }
    if (newPassword.trim().length < 6) {
      throw new ApiError(400, 'New password must be at least 6 characters long');
    }
    updateData.password = await bcrypt.hash(newPassword.trim(), 10);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData
  });

  const { password: _, ...safeUser } = updatedUser;

  return res.json({
    success: true,
    user: safeUser,
    message: newPassword
      ? 'Profile details and password updated successfully!'
      : 'Profile details updated successfully!'
  });
});
