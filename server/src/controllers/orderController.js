const prisma = require('../lib/prisma');
const { generatePayUHash } = require('../lib/payu');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

exports.createOrder = asyncHandler(async (req, res) => {
  const { items, customerDetails, referralCode, partnerLinkCode, isSimulation = false } = req.body;

  if (!items || !items.length || !customerDetails || !customerDetails.name || !customerDetails.phone) {
    throw new ApiError(400, 'Cart items and customer details are required');
  }

  const settings = await prisma.setting.findFirst();
  const gstPercent = (settings && settings.gstEnabled) ? settings.gstPercent : 0.0;
  const freeShippingAbove = settings ? settings.freeShippingAbove : 999.0;
  const standardShippingFee = settings ? settings.standardShippingFee : 60.0;

  // Calculate subtotal
  let subtotal = 0.0;
  const parsedItems = items.map(item => {
    const price = parseFloat(item.price || 999);
    const quantity = Math.max(1, parseInt(item.quantity || 1));
    const total = price * quantity;
    subtotal += total;

    return {
      productId: item.productId || item.id,
      title: item.title,
      price,
      quantity,
      total,
      image: item.image
    };
  });

  const gstAmount = parseFloat(((subtotal * gstPercent) / 100).toFixed(2));
  const shippingFee = subtotal >= freeShippingAbove ? 0.0 : standardShippingFee;

  // Check referral — PRIORITY: partnerLinkCode > referralCode
  let adminReferralId = null;
  let adminCommissionPercent = 0.0;
  let adminCommissionAmount = 0.0;
  let discountAmount = 0.0;
  let partnerLinkId = null;

  // 1. Try partner product link (new flow)
  const trimmedLinkCode = (partnerLinkCode || '').trim();
  const normalizedLinkCode = trimmedLinkCode.replace(/\s+/g, '-');
  if (trimmedLinkCode) {
    const pLink = await prisma.partnerProductLink.findFirst({
      where: {
        OR: [
          { linkCode: trimmedLinkCode },
          { linkCode: normalizedLinkCode },
          { linkCode: normalizedLinkCode.toUpperCase() }
        ]
      },
      include: { admin: true }
    });
    if (pLink && pLink.isActive) {
      adminReferralId = pLink.adminId;
      partnerLinkId = pLink.id;
      adminCommissionPercent = pLink.admin.commissionPercent || (settings ? settings.defaultCommissionPercent : 15.0);
      adminCommissionAmount = parseFloat(((subtotal * adminCommissionPercent) / 100).toFixed(2));
      discountAmount = parseFloat((subtotal * 0.05).toFixed(2)); // 5% discount for customer via partner link
    }
  }

  // 2. Fallback: legacy referral code (old flow)
  if (!adminReferralId) {
    const trimmedCode = (referralCode || '').trim().toUpperCase();
    if (trimmedCode) {
      const partner = await prisma.user.findFirst({
        where: {
          role: 'ADMIN',
          referralCode: trimmedCode
        }
      });
      if (partner) {
        adminReferralId = partner.id;
        adminCommissionPercent = partner.commissionPercent || (settings ? settings.defaultCommissionPercent : 15.0);
        adminCommissionAmount = parseFloat(((subtotal * adminCommissionPercent) / 100).toFixed(2));
        discountAmount = parseFloat((subtotal * 0.05).toFixed(2)); // 5% discount for customer via old flow
      }
    }
  }

  const finalAmount = parseFloat((subtotal + gstAmount + shippingFee - discountAmount).toFixed(2));
  const orderNumber = `RE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const txnid = `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const isCOD = req.body.paymentMethod === 'cod' || req.body.paymentMethod === 'Cash on Delivery';
  const selectedPaymentMethod = isCOD ? 'Cash on Delivery (COD)' : 'PayU Gateway (UPI / Cards / NetBanking)';

  const newOrder = await prisma.order.create({
    data: {
      orderNumber,
      userId: req.user ? req.user.id : null,
      customerName: customerDetails.name,
      customerEmail: customerDetails.email || (req.user ? req.user.email : 'guest@example.com'),
      customerPhone: customerDetails.phone,
      businessName: customerDetails.businessName || '',
      googleReviewLink: customerDetails.googleReviewLink || '',
      addressLine: customerDetails.address || customerDetails.shippingAddress?.line1 || '',
      city: customerDetails.city || customerDetails.shippingAddress?.city || '',
      state: customerDetails.state || customerDetails.shippingAddress?.state || '',
      pincode: customerDetails.pincode || customerDetails.shippingAddress?.pincode || '',
      items: JSON.stringify(parsedItems),
      subtotal,
      gstPercent,
      gstAmount,
      shippingFee,
      discountAmount,
      finalAmount,
      adminReferralId,
      adminCommissionPercent,
      adminCommissionAmount,
      adminCommissionStatus: adminReferralId ? 'pending' : null,
      partnerLinkId: partnerLinkId || null,
      paymentStatus: 'pending',
      paymentMethod: selectedPaymentMethod,
      payuTxnId: txnid,
      orderStatus: 'placed',
      courierName: 'Delhivery Express',
      trackingId: null,
      trackingUrl: null,
      trackingHistory: JSON.stringify([
        { status: 'Order Placed & Registered', date: new Date().toLocaleString('en-IN'), completed: true },
        { status: isCOD ? 'Cash on Delivery Verification' : 'Payment Verification (PayU)', date: 'In Progress', completed: false },
        { status: 'NFC Chip Programming & Custom QR Laser Print', date: 'Upcoming', completed: false },
        { status: 'Dispatched with Courier', date: 'Upcoming', completed: false },
        { status: 'Delivered', date: 'Upcoming', completed: false }
      ])
    }
  });


  const payuKey = settings?.payuMerchantKey || process.env.PAYU_TEST_KEY || process.env.PAYU_MERCHANT_KEY || 'GKJE3Z';
  const payuSalt = settings?.payuMerchantSalt || process.env.PAYU_TEST_SALT || process.env.PAYU_MERCHANT_SALT || '0zqiCnB4GslxAanSxjEAutWkWuggFiGs';

  const payuHash = generatePayUHash({
    key: payuKey,
    txnid,
    amount: finalAmount.toFixed(2),
    productinfo: `Order ${orderNumber}`,
    firstname: customerDetails.name.split(' ')[0] || 'Customer',
    email: customerDetails.email || 'customer@example.com',
    udf1: newOrder.id.toString(),
    udf2: req.user ? req.user.id.toString() : 'guest',
    udf3: adminReferralId ? adminReferralId.toString() : '',
    salt: payuSalt
  });

  return res.status(201).json({
    success: true,
    isCOD,
    order: {
      ...newOrder,
      items: JSON.parse(newOrder.items),
      trackingHistory: JSON.parse(newOrder.trackingHistory || '[]')
    },
    payuPayload: isCOD ? null : {
      actionUrl: (settings && settings.payuMode === 'live')
        ? 'https://secure.payu.in/_payment'
        : 'https://test.payu.in/_payment',
      key: payuKey,
      txnid,
      amount: finalAmount.toFixed(2),
      productinfo: `Order ${orderNumber}`,
      firstname: customerDetails.name.split(' ')[0] || 'Customer',
      email: customerDetails.email || 'customer@example.com',
      phone: customerDetails.phone,
      hash: payuHash,
      surl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/checkout/success?orderId=${newOrder.id}`,
      furl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/checkout?error=failed&orderId=${newOrder.id}`,
      udf1: newOrder.id.toString()
    }
  });
});


exports.getOrders = asyncHandler(async (req, res) => {
  const user = req.user;
  let whereClause = {};

  if (user.role === 'SUPERADMIN') {
    whereClause = {};
  } else if (user.role === 'ADMIN') {
    whereClause = { adminReferralId: user.id };
  } else {
    whereClause = {
      OR: [
        { userId: user.id },
        { customerEmail: user.email }
      ]
    };
  }

  const orders = await prisma.order.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      adminReferral: { select: { id: true, name: true, orgName: true, referralCode: true } }
    }
  });

  const parsed = orders.map(o => ({
    ...o,
    items: o.items ? JSON.parse(o.items) : [],
    trackingHistory: o.trackingHistory ? JSON.parse(o.trackingHistory) : []
  }));

  return res.json({ success: true, orders: parsed });
});

exports.getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { id: isNaN(id) ? undefined : parseInt(id) },
        { orderNumber: id }
      ]
    },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      adminReferral: { select: { id: true, name: true, orgName: true, referralCode: true } }
    }
  });

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  return res.json({
    success: true,
    order: {
      ...order,
      items: order.items ? JSON.parse(order.items) : [],
      trackingHistory: order.trackingHistory ? JSON.parse(order.trackingHistory) : []
    }
  });
});

exports.updateOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { orderStatus, paymentStatus, courierName, trackingId, trackingUrl, trackingHistory, adminCommissionStatus } = req.body;

  const existing = await prisma.order.findUnique({
    where: { id: parseInt(id) }
  });

  if (!existing) {
    throw new ApiError(404, 'Order not found');
  }

  const updated = await prisma.order.update({
    where: { id: parseInt(id) },
    data: {
      orderStatus: orderStatus || existing.orderStatus,
      paymentStatus: paymentStatus || existing.paymentStatus,
      adminCommissionStatus: adminCommissionStatus || existing.adminCommissionStatus,
      courierName: courierName !== undefined ? courierName : existing.courierName,
      trackingId: trackingId !== undefined ? trackingId : existing.trackingId,
      trackingUrl: trackingUrl !== undefined ? trackingUrl : existing.trackingUrl,
      trackingHistory: trackingHistory ? JSON.stringify(trackingHistory) : existing.trackingHistory
    }
  });

  return res.json({
    success: true,
    order: {
      ...updated,
      items: JSON.parse(updated.items),
      trackingHistory: JSON.parse(updated.trackingHistory || '[]')
    },
    message: 'Order updated successfully'
  });
});
