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
      // No partner discount for customers; customer pays full price, partner earns full commission
      discountAmount = 0.0;
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
        discountAmount = 0.0;
      }
    }
  }

  const finalAmount = parseFloat((subtotal + gstAmount + shippingFee - discountAmount).toFixed(2));

  // Generate clean sequential order & invoice number (e.g. RX-2026-0001, RX-2026-0002)
  const currentYear = new Date().getFullYear();
  const lastOrder = await prisma.order.findFirst({
    orderBy: { id: 'desc' },
    select: { id: true, orderNumber: true }
  });
  const nextSeq = lastOrder ? lastOrder.id + 1 : 1;
  const orderNumber = `RX-${currentYear}-${String(nextSeq).padStart(4, '0')}`;
  const txnid = `TXN_${currentYear}_${String(nextSeq).padStart(4, '0')}_${Date.now().toString().slice(-4)}`;
  const isCOD = req.body.paymentMethod === 'cod' || req.body.paymentMethod === 'Cash on Delivery';
  const selectedPaymentMethod = isCOD ? 'Cash on Delivery (COD)' : 'PayU Gateway (UPI / Cards / NetBanking)';

  // 3. Find or auto-create customer User record
  let customerUser = null;
  if (req.user) {
    customerUser = req.user;
    if (adminReferralId && !customerUser.referredById) {
      await prisma.user.update({
        where: { id: customerUser.id },
        data: { referredById: adminReferralId }
      }).catch(() => {});
    }
  } else if (customerDetails.email) {
    const cleanEmail = customerDetails.email.trim().toLowerCase();
    customerUser = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (!customerUser) {
      const bcrypt = require('bcryptjs');
      const defaultPassword = await bcrypt.hash('ReviewXpress@123', 10);
      customerUser = await prisma.user.create({
        data: {
          name: customerDetails.name.trim(),
          email: cleanEmail,
          phone: customerDetails.phone ? customerDetails.phone.trim() : null,
          password: defaultPassword,
          role: 'USER',
          referredById: adminReferralId || null
        }
      });
    } else if (adminReferralId && !customerUser.referredById) {
      customerUser = await prisma.user.update({
        where: { id: customerUser.id },
        data: { referredById: adminReferralId }
      });
    }
  }

  // Issue session cookie so guest customer is automatically authenticated
  if (customerUser) {
    const jwt = require('jsonwebtoken');
    const jwtSecret = process.env.JWT_KEY || process.env.JWT_SECRET || 'secret';
    const token = jwt.sign(
      { id: customerUser.id, email: customerUser.email, role: customerUser.role, name: customerUser.name },
      jwtSecret,
      { expiresIn: '30d' }
    );
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });
  }

  const newOrder = await prisma.order.create({
    data: {
      orderNumber,
      userId: customerUser ? customerUser.id : null,
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


  const isDummyOrInvalid = (val) => {
    if (!val || typeof val !== 'string') return true;
    const s = val.trim();
    if (s.length < 5) return true;
    if (s.toUpperCase().includes('DEMO')) return true;
    if (s.includes('••••')) return true;
    return false;
  };

  // Determine PayU Mode: Environment variable PAYU_MODE takes highest priority, then database setting
  const envMode = (process.env.PAYU_MODE || '').trim().toLowerCase();
  const dbMode = (settings?.payuMode || '').trim().toLowerCase();
  const isLive = envMode === 'live' || envMode === 'production' || (envMode !== 'test' && dbMode === 'live');

  const defaultTestKey = 'GKJE3Z';
  const defaultTestSalt = '0zqiCnB4GslxAanSxjEAutWkWuggFiGs';

  let payuKey;
  let payuSalt;

  if (isLive) {
    // In live mode, check LIVE variables first, then generic merchant variables, then DB setting
    payuKey = (!isDummyOrInvalid(process.env.PAYU_LIVE_KEY) ? process.env.PAYU_LIVE_KEY.trim() : null)
      || (!isDummyOrInvalid(process.env.PAYU_MERCHANT_KEY) ? process.env.PAYU_MERCHANT_KEY.trim() : null)
      || (!isDummyOrInvalid(process.env.PAYU_KEY) ? process.env.PAYU_KEY.trim() : null)
      || (!isDummyOrInvalid(settings?.payuMerchantKey) ? settings.payuMerchantKey.trim() : null)
      || defaultTestKey;

    payuSalt = (!isDummyOrInvalid(process.env.PAYU_LIVE_SALT) ? process.env.PAYU_LIVE_SALT.trim() : null)
      || (!isDummyOrInvalid(process.env.PAYU_MERCHANT_SALT) ? process.env.PAYU_MERCHANT_SALT.trim() : null)
      || (!isDummyOrInvalid(process.env.PAYU_SALT) ? process.env.PAYU_SALT.trim() : null)
      || (!isDummyOrInvalid(settings?.payuMerchantSalt) ? settings.payuMerchantSalt.trim() : null)
      || defaultTestSalt;
  } else {
    // In test mode, check TEST variables first, then DB setting, then generic merchant variables
    payuKey = (!isDummyOrInvalid(process.env.PAYU_TEST_KEY) ? process.env.PAYU_TEST_KEY.trim() : null)
      || (!isDummyOrInvalid(settings?.payuMerchantKey) ? settings.payuMerchantKey.trim() : null)
      || (!isDummyOrInvalid(process.env.PAYU_MERCHANT_KEY) ? process.env.PAYU_MERCHANT_KEY.trim() : null)
      || (!isDummyOrInvalid(process.env.PAYU_KEY) ? process.env.PAYU_KEY.trim() : null)
      || defaultTestKey;

    payuSalt = (!isDummyOrInvalid(process.env.PAYU_TEST_SALT) ? process.env.PAYU_TEST_SALT.trim() : null)
      || (!isDummyOrInvalid(settings?.payuMerchantSalt) ? settings.payuMerchantSalt.trim() : null)
      || (!isDummyOrInvalid(process.env.PAYU_MERCHANT_SALT) ? process.env.PAYU_MERCHANT_SALT.trim() : null)
      || (!isDummyOrInvalid(process.env.PAYU_SALT) ? process.env.PAYU_SALT.trim() : null)
      || defaultTestSalt;
  }

  // Determine gateway action URL based on active mode
  const payuActionUrl = isLive
    ? 'https://secure.payu.in/_payment'
    : (process.env.PAYU_BASE_URL || 'https://test.payu.in/_payment');

  console.log(`[PayU Checkout] Mode: ${isLive ? 'LIVE' : 'TEST'}, Endpoint: ${payuActionUrl}, Key: ${payuKey.slice(0, 4)}***`);

  const payuHash = generatePayUHash({
    key: payuKey,
    txnid,
    amount: finalAmount.toFixed(2),
    productinfo: `Order ${orderNumber}`,
    firstname: customerDetails.name.trim().split(/\s+/)[0] || 'Customer',
    email: customerDetails.email || 'customer@example.com',
    udf1: newOrder.id.toString(),
    udf2: '',
    udf3: '',
    udf4: '',
    udf5: '',
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
      actionUrl: payuActionUrl,
      key: payuKey,
      txnid,
      amount: finalAmount.toFixed(2),
      productinfo: `Order ${orderNumber}`,
      firstname: customerDetails.name.trim().split(/\s+/)[0] || 'Customer',
      email: customerDetails.email || 'customer@example.com',
      phone: customerDetails.phone,
      hash: payuHash,
      surl: `${process.env.SERVER_BASE_URL || 'http://localhost:5000'}/api/payu/response`,
      furl: `${process.env.SERVER_BASE_URL || 'http://localhost:5000'}/api/payu/response`,
      udf1: newOrder.id.toString(),
      udf2: '',
      udf3: '',
      udf4: '',
      udf5: ''
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
