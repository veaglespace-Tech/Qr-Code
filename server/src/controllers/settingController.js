const prisma = require('../lib/prisma');
const asyncHandler = require('../utils/asyncHandler');

exports.getSettings = asyncHandler(async (req, res) => {
  let settings = await prisma.setting.findFirst();
  if (!settings) {
    settings = await prisma.setting.create({
      data: {
        id: 1,
        siteName: "Review Express",
        address: "Pune, Maharashtra",
        payuMerchantKey: "GKJE3Z",
        payuMerchantSalt: "0zqiCnB4GslxAanSxjEAutWkWuggFiGs"
      }
    });
  }

  // Mask secret salt unless superadmin
  const safeSettings = { ...settings };
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
        payuMerchantKey: 'GKJE3Z',
        payuMerchantSalt: '0zqiCnB4GslxAanSxjEAutWkWuggFiGs',
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

  return res.json({ success: true, settings, message: 'Settings saved successfully' });
});
