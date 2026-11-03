const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  createOTP,
  verifyOTP,
  isEmailVerified,
  consumeEmailVerification
} = require('../../server/src/utils/otpStore');

describe('OTP Store Unit Tests', () => {
  const testEmail = 'shopper.test.unit@example.com';

  it('should generate a 6-digit numeric OTP with 10-minute expiry', () => {
    consumeEmailVerification(testEmail);
    const res = createOTP(testEmail);

    assert.strictEqual(res.success, true);
    assert.strictEqual(typeof res.otp, 'string');
    assert.strictEqual(res.otp.length, 6);
    assert.match(res.otp, /^\d{6}$/);
    assert.ok(res.expiresAt > Date.now());
  });

  it('should reject a second OTP request within 60 seconds (rate limiting)', () => {
    // Calling immediately again should trigger rate-limiting
    const secondReq = createOTP(testEmail);
    assert.strictEqual(secondReq.success, false);
    assert.match(secondReq.error, /Please wait \d+ seconds/i);
    assert.ok(secondReq.remainingSec > 0);
  });

  it('should fail verification when an incorrect OTP is provided', () => {
    const wrongAttempt = verifyOTP(testEmail, '000000');
    assert.strictEqual(wrongAttempt.success, false);
    assert.match(wrongAttempt.error, /Incorrect verification code/i);
    assert.strictEqual(isEmailVerified(testEmail), false);
  });

  it('should lock and delete OTP after 5 consecutive incorrect attempts', () => {
    const freshEmail = 'brute.attempt.test@example.com';
    consumeEmailVerification(freshEmail);
    createOTP(freshEmail);

    // 5 wrong attempts increment attempts from 0 to 5
    for (let i = 0; i < 5; i++) {
      const res = verifyOTP(freshEmail, '999999');
      assert.strictEqual(res.success, false);
      assert.match(res.error, /Incorrect verification code/i);
    }

    // 6th attempt triggers lockout because attempts >= 5
    const lockoutAttempt = verifyOTP(freshEmail, '999999');
    assert.strictEqual(lockoutAttempt.success, false);
    assert.match(lockoutAttempt.error, /Too many incorrect attempts/i);

    // Record should now be deleted
    const subsequentAttempt = verifyOTP(freshEmail, '999999');
    assert.strictEqual(subsequentAttempt.success, false);
    assert.match(subsequentAttempt.error, /No OTP verification request found/i);
  });

  it('should verify successfully with the correct OTP and mark email as verified', () => {
    const successEmail = 'verify.success.test@example.com';
    consumeEmailVerification(successEmail);
    const otpRes = createOTP(successEmail);
    assert.strictEqual(otpRes.success, true);

    const verifyRes = verifyOTP(successEmail, otpRes.otp);
    assert.strictEqual(verifyRes.success, true);
    assert.strictEqual(isEmailVerified(successEmail), true);
  });

  it('should consume and remove verification once registration is finalized', () => {
    const consumedEmail = 'consumed.record.test@example.com';
    consumeEmailVerification(consumedEmail);
    const otpRes = createOTP(consumedEmail);
    verifyOTP(consumedEmail, otpRes.otp);
    assert.strictEqual(isEmailVerified(consumedEmail), true);

    consumeEmailVerification(consumedEmail);
    assert.strictEqual(isEmailVerified(consumedEmail), false);
  });
});
