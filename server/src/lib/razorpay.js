const Razorpay = require('razorpay');
const crypto = require('crypto');
const prisma = require('./prisma');

/**
 * Get active Razorpay Credentials (from process.env or database Setting table)
 */
async function getRazorpayCredentials() {
  const envKey = process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_API_KEY || process.env.RAZORPAY_KEY;
  const envSecret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_API_SECRET || process.env.RAZORPAY_SECRET;

  if (envKey && envSecret && envKey.trim() && envSecret.trim()) {
    return {
      keyId: envKey.trim(),
      keySecret: envSecret.trim()
    };
  }

  // Fallback to Setting table in database
  try {
    const settings = await prisma.setting.findFirst({
      select: { razorpayKeyId: true, razorpayKeySecret: true }
    });
    if (settings && settings.razorpayKeyId && settings.razorpayKeySecret) {
      return {
        keyId: settings.razorpayKeyId.trim(),
        keySecret: settings.razorpayKeySecret.trim()
      };
    }
  } catch (err) {
    console.error('[Razorpay Credentials Lookup Error]', err.message);
  }

  return {
    keyId: envKey ? envKey.trim() : '',
    keySecret: envSecret ? envSecret.trim() : ''
  };
}

/**
 * Return an initialized Razorpay SDK client instance
 */
async function getRazorpayInstance() {
  const { keyId, keySecret } = await getRazorpayCredentials();

  if (!keyId || !keySecret) {
    console.warn('[Razorpay] Key ID or Secret is missing in environment and settings table.');
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
}

/**
 * Verify Razorpay payment signature
 * HMAC SHA256 of orderId + '|' + paymentId using secret
 */
function verifyRazorpaySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature, secret }) {
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !secret) {
    return false;
  }

  try {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const generatedSignature = hmac.digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(generatedSignature, 'utf8'),
      Buffer.from(razorpaySignature, 'utf8')
    );
  } catch (err) {
    console.error('[Razorpay Signature Verification Error]', err);
    return false;
  }
}

module.exports = {
  getRazorpayCredentials,
  getRazorpayInstance,
  verifyRazorpaySignature
};
