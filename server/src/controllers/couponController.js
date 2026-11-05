const prisma = require('../lib/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * Public: Validate and apply a coupon at checkout
 */
exports.applyCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;

  if (!code || !code.trim()) {
    throw new ApiError(400, 'Please enter a coupon code.');
  }

  const cleanCode = code.trim().toUpperCase();
  const orderSubtotal = parseFloat(subtotal || 0);

  if (orderSubtotal <= 0) {
    throw new ApiError(400, 'Order subtotal must be greater than zero to apply a coupon.');
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code: cleanCode }
  });

  if (!coupon || !coupon.isActive) {
    throw new ApiError(404, `Coupon code "${cleanCode}" is invalid or no longer active.`);
  }

  // Check Expiry Date
  if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
    throw new ApiError(400, `Coupon code "${cleanCode}" expired on ${new Date(coupon.expiryDate).toLocaleDateString('en-IN')}.`);
  }

  // Check Usage Limit
  if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, `Coupon code "${cleanCode}" has reached its maximum usage limit.`);
  }

  // Check Minimum Order Amount
  if (coupon.minOrderAmount && orderSubtotal < coupon.minOrderAmount) {
    throw new ApiError(
      400,
      `Coupon code "${cleanCode}" requires a minimum order subtotal of ₹${coupon.minOrderAmount}. (Current: ₹${orderSubtotal})`
    );
  }

  // Calculate Discount Amount
  let discount = 0;
  if (coupon.discountType === 'PERCENTAGE') {
    discount = (orderSubtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }
  } else {
    // FLAT discount
    discount = Math.min(coupon.discountValue, orderSubtotal);
  }

  discount = parseFloat(discount.toFixed(2));

  return res.json({
    success: true,
    valid: true,
    message: `Coupon "${cleanCode}" applied! You saved ₹${discount}.`,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue
    },
    discountAmount: discount
  });
});

/**
 * Superadmin: Get all coupons
 */
exports.getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return res.json({ success: true, coupons });
});

/**
 * Superadmin: Create new coupon
 */
exports.createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    description,
    discountType = 'PERCENTAGE',
    discountValue,
    minOrderAmount = 0,
    maxDiscountAmount,
    expiryDate,
    usageLimit,
    isActive = true
  } = req.body;

  if (!code || !code.trim()) {
    throw new ApiError(400, 'Coupon code is required.');
  }

  const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '');

  if (!discountValue || isNaN(discountValue) || parseFloat(discountValue) <= 0) {
    throw new ApiError(400, 'Please enter a valid discount value greater than 0.');
  }

  const existing = await prisma.coupon.findUnique({
    where: { code: cleanCode }
  });

  if (existing) {
    throw new ApiError(400, `A coupon with code "${cleanCode}" already exists.`);
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: cleanCode,
      description: description ? description.trim() : null,
      discountType: discountType === 'FLAT' ? 'FLAT' : 'PERCENTAGE',
      discountValue: parseFloat(discountValue),
      minOrderAmount: parseFloat(minOrderAmount || 0),
      maxDiscountAmount: maxDiscountAmount && !isNaN(maxDiscountAmount) ? parseFloat(maxDiscountAmount) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      usageLimit: usageLimit && !isNaN(usageLimit) ? parseInt(usageLimit, 10) : null,
      isActive: Boolean(isActive)
    }
  });

  return res.status(201).json({
    success: true,
    coupon,
    message: `Coupon "${cleanCode}" created successfully.`
  });
});

/**
 * Superadmin: Update coupon
 */
exports.updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    description,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscountAmount,
    expiryDate,
    usageLimit,
    isActive
  } = req.body;

  const existing = await prisma.coupon.findUnique({
    where: { id: parseInt(id, 10) }
  });

  if (!existing) {
    throw new ApiError(404, 'Coupon not found.');
  }

  const updateData = {};
  if (description !== undefined) updateData.description = description ? description.trim() : null;
  if (discountType !== undefined) updateData.discountType = discountType === 'FLAT' ? 'FLAT' : 'PERCENTAGE';
  if (discountValue !== undefined) updateData.discountValue = parseFloat(discountValue);
  if (minOrderAmount !== undefined) updateData.minOrderAmount = parseFloat(minOrderAmount || 0);
  if (maxDiscountAmount !== undefined) updateData.maxDiscountAmount = maxDiscountAmount ? parseFloat(maxDiscountAmount) : null;
  if (expiryDate !== undefined) updateData.expiryDate = expiryDate ? new Date(expiryDate) : null;
  if (usageLimit !== undefined) updateData.usageLimit = usageLimit ? parseInt(usageLimit, 10) : null;
  if (isActive !== undefined) updateData.isActive = Boolean(isActive);

  const updated = await prisma.coupon.update({
    where: { id: parseInt(id, 10) },
    data: updateData
  });

  return res.json({
    success: true,
    coupon: updated,
    message: `Coupon "${updated.code}" updated successfully.`
  });
});

/**
 * Superadmin: Delete coupon
 */
exports.deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.coupon.delete({
    where: { id: parseInt(id, 10) }
  });

  return res.json({
    success: true,
    message: 'Coupon deleted successfully.'
  });
});
