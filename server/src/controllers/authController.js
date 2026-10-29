const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_KEY || process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );
};

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role = 'USER', orgName, bankDetails, referralCodeUsed } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email and password are required');
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() }
  });

  if (existingUser) {
    throw new ApiError(400, 'Account with this email already exists');
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
      email: email.toLowerCase().trim(),
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

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() }
  });

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
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
  return res.json({ success: true, user: req.user });
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
