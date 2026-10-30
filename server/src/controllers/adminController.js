const prisma = require('../lib/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const crypto = require('crypto');

// Helper: generate unique link code
function generateLinkCode(orgName, productSlug) {
  const orgPart = (orgName || 'LINK').replace(/\s+/g, '').toUpperCase().slice(0, 4);
  const prodPart = (productSlug || 'PROD').toUpperCase().replace(/-/g, '').slice(0, 6);
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${orgPart}-${prodPart}-${rand}`;
}

exports.getAdminStats = asyncHandler(async (req, res) => {
  const adminId = req.user.id;
  const settings = await prisma.setting.findFirst();

  const referredOrders = await prisma.order.findMany({
    where: { adminReferralId: adminId },
    orderBy: { createdAt: 'desc' }
  });

  const paidOrders = referredOrders.filter(o => o.paymentStatus === 'paid');
  const totalSalesVolume = paidOrders.reduce((sum, o) => sum + o.subtotal, 0.0);
  const totalCommissionEarned = paidOrders.reduce((sum, o) => sum + o.adminCommissionAmount, 0.0);

  const payouts = await prisma.payout.findMany({
    where: { adminId },
    orderBy: { requestedAt: 'desc' }
  });

  const totalPaidOut = payouts
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + p.amount, 0.0);

  const pendingPayoutRequests = payouts
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0.0);

  const availableBalance = Math.max(0.0, totalCommissionEarned - totalPaidOut - pendingPayoutRequests);

  return res.json({
    success: true,
    partner: {
      id: req.user.id,
      name: req.user.name,
      orgName: req.user.orgName,
      referralCode: req.user.referralCode,
      commissionPercent: req.user.commissionPercent,
      bankHolder: req.user.bankHolder,
      bankAccount: req.user.bankAccount,
      bankName: req.user.bankName,
      ifscCode: req.user.ifscCode,
      upiId: req.user.upiId
    },
    metrics: {
      totalReferredOrders: referredOrders.length,
      successfulOrders: paidOrders.length,
      totalSalesVolume: parseFloat(totalSalesVolume.toFixed(2)),
      totalCommissionEarned: parseFloat(totalCommissionEarned.toFixed(2)),
      totalPaidOut: parseFloat(totalPaidOut.toFixed(2)),
      pendingPayoutRequests: parseFloat(pendingPayoutRequests.toFixed(2)),
      availableBalance: parseFloat(availableBalance.toFixed(2)),
      minPayoutAmount: settings ? settings.minPayoutAmount : 500.0
    },
    recentOrders: referredOrders.slice(0, 10).map(o => ({
      ...o,
      items: o.items ? JSON.parse(o.items) : []
    })),
    payoutHistory: payouts
  });
});

exports.requestPayout = asyncHandler(async (req, res) => {
  const adminId = req.user.id;
  const { amount, notes } = req.body;
  const reqAmount = parseFloat(amount);

  const settings = await prisma.setting.findFirst();
  const minPayout = settings ? settings.minPayoutAmount : 500.0;

  if (!reqAmount || reqAmount < minPayout) {
    throw new ApiError(400, `Minimum payout request amount is ₹${minPayout}`);
  }

  const paidOrders = await prisma.order.findMany({
    where: { adminReferralId: adminId, paymentStatus: 'paid' }
  });
  const totalEarned = paidOrders.reduce((sum, o) => sum + o.adminCommissionAmount, 0.0);

  const existingPayouts = await prisma.payout.findMany({
    where: { adminId, status: { not: 'rejected' } }
  });
  const committed = existingPayouts.reduce((sum, p) => sum + p.amount, 0.0);
  const available = totalEarned - committed;

  if (reqAmount > available) {
    throw new ApiError(400, `Insufficient balance. Available balance is ₹${available.toFixed(2)}`);
  }

  const payout = await prisma.payout.create({
    data: {
      adminId,
      amount: reqAmount,
      notes: notes || '',
      status: 'pending'
    }
  });

  return res.status(201).json({
    success: true,
    payout,
    message: 'Payout request submitted successfully. Superadmin will process your transfer.'
  });
});

exports.updateBankDetails = asyncHandler(async (req, res) => {
  const adminId = req.user.id;
  const { bankHolder, bankAccount, bankName, ifscCode, upiId } = req.body;

  const updated = await prisma.user.update({
    where: { id: adminId },
    data: {
      bankHolder,
      bankAccount,
      bankName,
      ifscCode,
      upiId
    }
  });

  const { password, ...safe } = updated;
  return res.json({ success: true, user: safe, message: 'Bank & UPI details updated successfully' });
});

// ─────────────────────────────────────────────────────────────
// PARTNER PRODUCT LINKS
// ─────────────────────────────────────────────────────────────

// GET /api/admin/product-links — list all my product links
exports.getMyProductLinks = asyncHandler(async (req, res) => {
  const adminId = req.user.id;

  // Get all products + existing links for this partner in one shot
  const [products, links] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.partnerProductLink.findMany({
      where: { adminId },
      include: { product: true }
    })
  ]);

  const linksMap = {};
  links.forEach(l => { linksMap[l.productId] = l; });

  const result = products.map(p => ({
    product: p,
    link: linksMap[p.id] || null
  }));

  return res.json({ success: true, items: result });
});

// POST /api/admin/product-links — generate (or fetch existing) link for a product
exports.generateProductLink = asyncHandler(async (req, res) => {
  const adminId = req.user.id;
  const { productId } = req.body;

  if (!productId) throw new ApiError(400, 'productId is required');

  const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
  if (!product) throw new ApiError(404, 'Product not found');

  // Check if link already exists
  const existing = await prisma.partnerProductLink.findFirst({
    where: { adminId, productId: Number(productId) }
  });
  if (existing) {
    return res.json({ success: true, link: existing, alreadyExisted: true });
  }

  // Generate new unique code
  let linkCode;
  let attempts = 0;
  do {
    linkCode = generateLinkCode(req.user.orgName || req.user.name, product.slug);
    const clash = await prisma.partnerProductLink.findUnique({ where: { linkCode } });
    if (!clash) break;
    attempts++;
  } while (attempts < 5);

  const link = await prisma.partnerProductLink.create({
    data: {
      adminId,
      productId: Number(productId),
      linkCode,
      isActive: true
    }
  });

  return res.status(201).json({ success: true, link, alreadyExisted: false });
});

// PUT /api/admin/product-links/:id/toggle — activate/deactivate a link
exports.toggleProductLink = asyncHandler(async (req, res) => {
  const adminId = req.user.id;
  const linkId = Number(req.params.id);

  const link = await prisma.partnerProductLink.findUnique({ where: { id: linkId } });
  if (!link || link.adminId !== adminId) throw new ApiError(404, 'Link not found');

  const updated = await prisma.partnerProductLink.update({
    where: { id: linkId },
    data: { isActive: !link.isActive }
  });

  return res.json({ success: true, link: updated });
});
