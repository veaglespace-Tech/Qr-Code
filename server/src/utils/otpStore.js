const crypto = require('crypto');

/**
 * In-Memory OTP Store
 * Key: normalized email
 * Value: { otp: string, expiresAt: number, verified: boolean, lastSentAt: number, attempts: number }
 */
const otpStore = new Map();

// Clean up expired entries every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, record] of otpStore.entries()) {
    if (record.expiresAt < now) {
      otpStore.delete(email);
    }
  }
}, 15 * 60 * 1000);

/**
 * Generate and store a secure 6-digit OTP for an email
 * @param {string} email
 * @returns {{ success: boolean, otp?: string, error?: string, remainingSec?: number }}
 */
function createOTP(email) {
  const key = email.trim().toLowerCase();
  const now = Date.now();
  const existing = otpStore.get(key);

  // Rate-limiting: only 1 OTP per 60 seconds
  if (existing && existing.lastSentAt && (now - existing.lastSentAt < 60 * 1000)) {
    const remainingSec = Math.ceil((60 * 1000 - (now - existing.lastSentAt)) / 1000);
    return {
      success: false,
      error: `Please wait ${remainingSec} seconds before requesting another verification code.`,
      remainingSec
    };
  }

  // Generate 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = now + 10 * 60 * 1000; // 10 minutes validity

  otpStore.set(key, {
    otp,
    expiresAt,
    verified: false,
    lastSentAt: now,
    attempts: 0
  });

  return { success: true, otp, expiresAt };
}

/**
 * Verify submitted OTP against stored OTP
 * @param {string} email
 * @param {string} submittedOtp
 * @returns {{ success: boolean, error?: string }}
 */
function verifyOTP(email, submittedOtp) {
  const key = email.trim().toLowerCase();
  const record = otpStore.get(key);

  if (!record) {
    return { success: false, error: 'No OTP verification request found. Please request a new code.' };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(key);
    return { success: false, error: 'The verification code has expired. Please request a new one.' };
  }

  if (record.attempts >= 5) {
    otpStore.delete(key);
    return { success: false, error: 'Too many incorrect attempts. Please request a new verification code.' };
  }

  if (record.otp !== submittedOtp.toString().trim()) {
    record.attempts += 1;
    return { success: false, error: 'Incorrect verification code. Please check and try again.' };
  }

  // Mark as verified
  record.verified = true;
  return { success: true };
}

/**
 * Check if an email is marked as verified
 * @param {string} email
 * @returns {boolean}
 */
function isEmailVerified(email) {
  const key = email.trim().toLowerCase();
  const record = otpStore.get(key);
  return Boolean(record && record.verified && (Date.now() <= record.expiresAt + 30 * 60 * 1000));
}

/**
 * Consume / remove verified record once registration is complete
 * @param {string} email
 */
function consumeEmailVerification(email) {
  const key = email.trim().toLowerCase();
  otpStore.delete(key);
}

module.exports = {
  createOTP,
  verifyOTP,
  isEmailVerified,
  consumeEmailVerification
};
