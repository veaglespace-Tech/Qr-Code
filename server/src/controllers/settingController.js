const prisma = require('../lib/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendContactInquiryEmails } = require('../utils/mailer');

// In-memory cache for ultra-fast response
let cachedSettings = null;
let lastSettingsFetch = 0;
const SETTINGS_CACHE_TTL = 60 * 1000;

function clearSettingsCache() {
  cachedSettings = null;
  lastSettingsFetch = 0;
}

exports.clearSettingsCache = clearSettingsCache;

exports.getSettings = asyncHandler(async (req, res) => {
  const now = Date.now();
  if (cachedSettings && (now - lastSettingsFetch < SETTINGS_CACHE_TTL)) {
    const safeSettings = { ...cachedSettings };
    if (!req.user || req.user.role !== 'SUPERADMIN') {
      delete safeSettings.payuMerchantSalt;
    }
    return res.json({ success: true, settings: safeSettings });
  }

  let settings = await prisma.setting.findFirst();

  const accurateAddress = "'Kudale Patil Tower', Office No. 207, 2nd Floor, Jadhav Nagar, Near Shiv Temple, Vadgaon Budruk, Pune, Maharashtra 411041";
  const accurateEmail = "info@veaglespace.com";
  const accuratePhone = "+91 8237999101";
  const accurateWhatsapp = "918237999101";

  if (!settings) {
    settings = await prisma.setting.create({
      data: {
        id: 1,
        siteName: "ReviewXpress",
        tagline: "India's #1 Smart NFC & QR Google Review Hardware Platform",
        supportEmail: accurateEmail,
        supportPhone: accuratePhone,
        whatsappNumber: accurateWhatsapp,
        address: accurateAddress,
        payuMerchantKey: process.env.PAYU_MERCHANT_KEY || "sV29rC",
        payuMerchantSalt: process.env.PAYU_MERCHANT_SALT || "tkhRPTPLZtQRHlnuruaKzB9OSbvdS2sA"
      }
    });
  } else {
    // Auto-migrate old dummy or placeholder data stored in live database
    const isDummyAddress = !settings.address || settings.address.includes('Tech Hub') || settings.address.includes('411045') || settings.address.trim() === 'Pune, Maharashtra';
    const isDummyEmail = !settings.supportEmail || settings.supportEmail === 'support@reviewexpress.in' || settings.supportEmail.includes('example.com');
    const isDummyPhone = !settings.supportPhone || settings.supportPhone.includes('98765 43210') || settings.supportPhone.includes('9876543210');
    const isDummyWhatsapp = !settings.whatsappNumber || settings.whatsappNumber === '919876543210';
    const isOldSiteName = settings.siteName === 'Review Express';

    if (isDummyAddress || isDummyEmail || isDummyPhone || isDummyWhatsapp || isOldSiteName) {
      settings = await prisma.setting.update({
        where: { id: settings.id },
        data: {
          ...(isOldSiteName ? { siteName: 'ReviewXpress' } : {}),
          ...(isDummyAddress ? { address: accurateAddress } : {}),
          ...(isDummyEmail ? { supportEmail: accurateEmail } : {}),
          ...(isDummyPhone ? { supportPhone: accuratePhone } : {}),
          ...(isDummyWhatsapp ? { whatsappNumber: accurateWhatsapp } : {})
        }
      });
    }
  }

  // Update in-memory cache
  cachedSettings = { ...settings };
  lastSettingsFetch = Date.now();

  // Mask secret salt unless superadmin
  const safeSettings = { ...settings };
  if (process.env.PAYU_MERCHANT_KEY) {
    safeSettings.payuMerchantKey = process.env.PAYU_MERCHANT_KEY;
  }
  if (process.env.PAYU_BASE_URL) {
    safeSettings.payuMode = process.env.PAYU_BASE_URL.includes('test') ? 'test' : 'live';
  }
  if (!req.user || req.user.role !== 'SUPERADMIN') {
    delete safeSettings.payuMerchantSalt;
  }

  return res.json({ success: true, settings: safeSettings });
});

exports.updateSettings = asyncHandler(async (req, res) => {
  const updates = { ...req.body };

  // Never overwrite salt if it's empty, whitespace, masked bullets, or dummy
  if (
    !updates.payuMerchantSalt ||
    typeof updates.payuMerchantSalt !== 'string' ||
    updates.payuMerchantSalt.trim() === '' ||
    updates.payuMerchantSalt.includes('••••') ||
    updates.payuMerchantSalt.toUpperCase().includes('DEMO')
  ) {
    delete updates.payuMerchantSalt;
  } else {
    updates.payuMerchantSalt = updates.payuMerchantSalt.trim();
  }

  // Never overwrite key if it's empty, dummy, or invalid
  if (updates.payuMerchantKey !== undefined) {
    const k = typeof updates.payuMerchantKey === 'string' ? updates.payuMerchantKey.trim() : '';
    if (k === '' || k.toUpperCase().includes('DEMO') || k.length < 4) {
      delete updates.payuMerchantKey;
    } else {
      updates.payuMerchantKey = k;
    }
  }

  let settings = await prisma.setting.findFirst();

  if (!settings) {
    settings = await prisma.setting.create({
      data: {
        id: 1,
        payuMerchantKey: process.env.PAYU_MERCHANT_KEY || 'sV29rC',
        payuMerchantSalt: process.env.PAYU_MERCHANT_SALT || 'tkhRPTPLZtQRHlnuruaKzB9OSbvdS2sA',
        ...updates
      }
    });
  } else {
    settings = await prisma.setting.update({
      where: { id: settings.id },
      data: {
        ...updates,
        gstPercent: updates.gstPercent !== undefined ? parseFloat(updates.gstPercent) : settings.gstPercent,
        defaultCommissionPercent: updates.defaultCommissionPercent !== undefined ? parseFloat(updates.defaultCommissionPercent) : settings.defaultCommissionPercent,
        minPayoutAmount: updates.minPayoutAmount !== undefined ? parseFloat(updates.minPayoutAmount) : settings.minPayoutAmount,
        freeShippingAbove: updates.freeShippingAbove !== undefined ? parseFloat(updates.freeShippingAbove) : settings.freeShippingAbove,
        standardShippingFee: updates.standardShippingFee !== undefined ? parseFloat(updates.standardShippingFee) : settings.standardShippingFee
      }
    });
  }

  clearSettingsCache();
  return res.json({ success: true, settings, message: 'Settings saved successfully' });
});

exports.submitContact = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) {
    throw new ApiError(400, 'Name, email, and message are required.');
  }

  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    throw new ApiError(400, 'Please provide a valid email address.');
  }

  // Send inquiry emails (alert to Admin + auto-acknowledgement to User)
  sendContactInquiryEmails({
    name: name.trim(),
    email: cleanEmail,
    phone: (phone || '').trim(),
    subject: (subject || 'General Inquiry').trim(),
    message: message.trim()
  }).catch(err => console.error('[Contact Inquiry Email Error]', err));

  return res.json({
    success: true,
    message: 'Thank you! Your inquiry has been received. Our support team will get in touch shortly.'
  });
});
