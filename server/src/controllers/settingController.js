const prisma = require('../lib/prisma');
const asyncHandler = require('../utils/asyncHandler');

exports.getSettings = asyncHandler(async (req, res) => {
  let settings = await prisma.setting.findFirst();
  if (!settings) {
    settings = await prisma.setting.create({
      data: {
        id: 1,
        siteName: "Review Express",
        address: "Pune, Maharashtra"
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
  const updates = req.body;
  let settings = await prisma.setting.findFirst();

  if (!settings) {
    settings = await prisma.setting.create({
      data: { id: 1, ...updates }
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
