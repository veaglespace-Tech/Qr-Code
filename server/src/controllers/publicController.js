const prisma = require('../lib/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// GET /api/buy/:linkCode
// Resolves a partner-product link: returns product + partner info
// Also increments click count
exports.resolveProductLink = asyncHandler(async (req, res) => {
  const { linkCode } = req.params;

  const link = await prisma.partnerProductLink.findUnique({
    where: { linkCode },
    include: {
      product: true,
      admin: {
        select: {
          id: true,
          name: true,
          orgName: true,
          commissionPercent: true,
          referralCode: true,
          phone: true
        }
      }
    }
  });

  if (!link) throw new ApiError(404, 'Invalid or expired referral link');
  if (!link.isActive) throw new ApiError(410, 'This referral link is no longer active');

  // Increment click count (fire and forget)
  prisma.partnerProductLink.update({
    where: { id: link.id },
    data: { clickCount: { increment: 1 } }
  }).catch(() => {});

  return res.json({
    success: true,
    linkCode: link.linkCode,
    linkId: link.id,
    product: link.product,
    partner: {
      id: link.admin.id,
      name: link.admin.name,
      orgName: link.admin.orgName || link.admin.name,
      referralCode: link.admin.referralCode,
      phone: link.admin.phone
    },
    clickCount: link.clickCount
  });
});

