const prisma = require('../lib/prisma');
const { generatePayUHash } = require('../lib/payu');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const {
  sendOrderConfirmationEmail,
  sendNewOrderAdminAlert,
  sendPartnerCommissionAlert
} = require('../utils/mailer');

exports.createOrder = asyncHandler(async (req, res) => {
  const { items, customerDetails, referralCode, partnerLinkCode, isSimulation = false } = req.body;

  if (!items || !items.length || !customerDetails || !customerDetails.name || !customerDetails.phone) {
    throw new ApiError(400, 'Cart items and customer details are required');
  }

  const settings = await prisma.setting.findFirst();
  const gstPercent = (settings && settings.gstEnabled)
    ? (settings.gstPercent !== undefined ? settings.gstPercent : 18.0)
    : 0.0;
  const freeShippingEnabled = settings?.freeShippingEnabled !== undefined ? Boolean(settings.freeShippingEnabled) : true;
  const freeShippingAbove = (settings && settings.freeShippingAbove !== undefined) ? settings.freeShippingAbove : 999.0;
  const standardShippingFee = (settings && settings.standardShippingFee !== undefined) ? settings.standardShippingFee : 60.0;

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
      image: item.image,
      productType: item.productType || 'physical'
    };
  });

  // Check if any item is a physical product (requires shipping)
  const hasPhysicalProduct = parsedItems.some(item => item.productType !== 'digital');

  // Courier shipping calculation — only for physical products
  let shippingFee = 0.0;
  if (hasPhysicalProduct) {
    shippingFee = standardShippingFee;
    if (standardShippingFee === 0) {
      shippingFee = 0.0;
    } else if (freeShippingEnabled && freeShippingAbove > 0 && subtotal >= freeShippingAbove) {
      shippingFee = 0.0;
    }
  }

  // Coupon validation & discount calculation
  let couponDiscount = 0.0;
  let appliedCouponCode = null;
  const rawCouponCode = req.body.couponCode;

  if (rawCouponCode && String(rawCouponCode).trim()) {
    const codeToVerify = String(rawCouponCode).trim().toUpperCase();
    const coupon = await prisma.coupon.findUnique({
      where: { code: codeToVerify }
    });

    if (coupon && coupon.isActive) {
      const isExpired = coupon.expiryDate && new Date() > new Date(coupon.expiryDate);
      const limitReached = coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit;
      const minOrderMet = !coupon.minOrderAmount || subtotal >= coupon.minOrderAmount;

      if (!isExpired && !limitReached && minOrderMet) {
        if (coupon.discountType === 'PERCENTAGE') {
          couponDiscount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscountAmount && couponDiscount > coupon.maxDiscountAmount) {
            couponDiscount = coupon.maxDiscountAmount;
          }
        } else {
          couponDiscount = Math.min(coupon.discountValue, subtotal);
        }
        couponDiscount = parseFloat(couponDiscount.toFixed(2));
        appliedCouponCode = coupon.code;

        // Increment coupon used count safely
        prisma.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } }
        }).catch(err => console.error('[Coupon usedCount error]', err));
      }
    }
  }

  // Taxable subtotal after coupon discount
  const taxableSubtotal = Math.max(0, subtotal - couponDiscount);
  const gstAmount = parseFloat(((taxableSubtotal * gstPercent) / 100).toFixed(2));
  const finalAmount = parseFloat((taxableSubtotal + gstAmount + shippingFee).toFixed(2));

  // Check referral - PRIORITY: partnerLinkCode > referralCode
  // Commission priority: Product specific > Partner specific > Default platform
  let adminReferralId = null;
  let adminCommissionPercent = 0.0;
  let adminCommissionAmount = 0.0;
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
      include: { admin: true, product: true }
    });
    if (pLink && pLink.isActive) {
      adminReferralId = pLink.adminId;
      partnerLinkId = pLink.id;

      // Priority: 1. Partner-specific product commission -> 2. Product base commission -> 3. Partner base commission -> 4. Platform default
      if (pLink.customCommission !== null && pLink.customCommission !== undefined && pLink.customCommission >= 0) {
        adminCommissionPercent = pLink.customCommission;
      } else if (pLink.product && pLink.product.commissionPercent && pLink.product.commissionPercent > 0) {
        adminCommissionPercent = pLink.product.commissionPercent;
      } else if (pLink.admin && pLink.admin.commissionPercent && pLink.admin.commissionPercent > 0) {
        adminCommissionPercent = pLink.admin.commissionPercent;
      } else {
        adminCommissionPercent = settings ? settings.defaultCommissionPercent : 15.0;
      }

      adminCommissionAmount = parseFloat(((subtotal * adminCommissionPercent) / 100).toFixed(2));
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

        // Check if partner has custom product-wise commission or product has custom rate
        let partnerProductCustomComm = null;
        let productCommission = 0;
        const firstProductId = parsedItems[0]?.productId;
        if (firstProductId) {
          const [prod, customLink] = await Promise.all([
            prisma.product.findUnique({
              where: { id: parseInt(firstProductId) },
              select: { commissionPercent: true }
            }),
            prisma.partnerProductLink.findFirst({
              where: {
                adminId: partner.id,
                productId: parseInt(firstProductId)
              },
              select: { customCommission: true }
            })
          ]);

          if (customLink && customLink.customCommission !== null && customLink.customCommission !== undefined && customLink.customCommission >= 0) {
            partnerProductCustomComm = customLink.customCommission;
          }
          if (prod && prod.commissionPercent && prod.commissionPercent > 0) {
            productCommission = prod.commissionPercent;
          }
        }

        if (partnerProductCustomComm !== null) {
          adminCommissionPercent = partnerProductCustomComm;
        } else if (productCommission > 0) {
          adminCommissionPercent = productCommission;
        } else if (partner.commissionPercent && partner.commissionPercent > 0) {
          adminCommissionPercent = partner.commissionPercent;
        } else {
          adminCommissionPercent = settings ? settings.defaultCommissionPercent : 15.0;
        }

        adminCommissionAmount = parseFloat(((subtotal * adminCommissionPercent) / 100).toFixed(2));
      }
    }
  }

  // Generate clean sequential order & invoice number (e.g. RX-2026-0001, RX-2026-0002)
  const currentYear = new Date().getFullYear();
  const lastOrder = await prisma.order.findFirst({
    orderBy: { id: 'desc' },
    select: { id: true, orderNumber: true }
  });
  const nextSeq = lastOrder ? lastOrder.id + 1 : 1;
  const orderNumber = `RX-${currentYear}-${String(nextSeq).padStart(4, '0')}`;
  const txnid = `TXN_${currentYear}_${String(nextSeq).padStart(4, '0')}_${Date.now().toString().slice(-4)}`;
  if (req.body.paymentMethod === 'cod' || req.body.paymentMethod === 'Cash on Delivery') {
    throw new ApiError(400, 'Cash on Delivery is currently disabled. Please proceed with Online Payment via PayU.');
  }
  const isCOD = false;
  const selectedPaymentMethod = 'PayU Gateway (UPI / Cards / NetBanking)';

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
      discountAmount: couponDiscount,
      couponCode: appliedCouponCode,
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

  // If order is COD (confirmed immediately upon placement), trigger emails
  if (isCOD) {
    sendOrderConfirmationEmail(newOrder, parsedItems).catch(err => console.error('[COD Order Confirmation Email Error]', err));
    sendNewOrderAdminAlert(newOrder, parsedItems).catch(err => console.error('[COD New Order Admin Alert Error]', err));
    if (adminReferralId && adminCommissionAmount > 0) {
      prisma.user.findUnique({ where: { id: adminReferralId } }).then(partner => {
        if (partner) sendPartnerCommissionAlert(partner, newOrder, adminCommissionAmount);
      }).catch(err => console.error('[COD Partner Commission Alert Error]', err));
    }
  }

  // PayU Gateway credentials directly from env, with fallback to settings
  const payuKey = (
    process.env.PAYU_MERCHANT_KEY ||
    process.env.PAYU_KEY ||
    settings?.payuMerchantKey ||
    'sV29rC'
  ).trim();

  const payuSalt = (
    process.env.PAYU_MERCHANT_SALT ||
    process.env.PAYU_SALT ||
    settings?.payuMerchantSalt ||
    'tkhRPTPLZtQRHlnuruaKzB9OSbvdS2sA'
  ).trim();

  const payuActionUrl = (
    process.env.PAYU_BASE_URL ||
    'https://secure.payu.in/_payment'
  ).trim();

  console.log(`[PayU Checkout] Action URL: ${payuActionUrl}, Key: ${payuKey.slice(0, 4)}***`);

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
