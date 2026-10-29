const prisma = require('../lib/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

exports.getAnalytics = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany();
  const paidOrders = orders.filter(o => o.paymentStatus === 'paid');

  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.finalAmount, 0.0);
  const totalGstCollected = paidOrders.reduce((sum, o) => sum + o.gstAmount, 0.0);
  const totalAdminCommissions = paidOrders.reduce((sum, o) => sum + o.adminCommissionAmount, 0.0);

  const partnersCount = await prisma.user.count({ where: { role: 'ADMIN' } });
  const customersCount = await prisma.user.count({ where: { role: 'USER' } });
  const productsCount = await prisma.product.count();

  const payouts = await prisma.payout.findMany();
  const totalPaidOut = payouts
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + p.amount, 0.0);
  const pendingPayoutsCount = payouts.filter(p => p.status === 'pending').length;

  return res.json({
    success: true,
    analytics: {
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalGstCollected: parseFloat(totalGstCollected.toFixed(2)),
      totalAdminCommissions: parseFloat(totalAdminCommissions.toFixed(2)),
      netPlatformProfit: parseFloat((totalRevenue - totalGstCollected - totalAdminCommissions).toFixed(2)),
      totalOrdersCount: orders.length,
      paidOrdersCount: paidOrders.length,
      partnersCount,
      customersCount,
      productsCount,
      totalPaidOut: parseFloat(totalPaidOut.toFixed(2)),
      pendingPayoutsCount
    }
  });
});

exports.getAdminById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const admin = await prisma.user.findUnique({
    where: { id: parseInt(id) },
    include: {
      referredOrders: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          customerEmail: true,
          customerPhone: true,
          businessName: true,
          finalAmount: true,
          subtotal: true,
          adminCommissionAmount: true,
          adminCommissionPercent: true,
          adminCommissionStatus: true,
          paymentStatus: true,
          orderStatus: true,
          createdAt: true,
          city: true,
          state: true
        }
      },
      payouts: {
        orderBy: { requestedAt: 'desc' },
        select: {
          id: true,
          amount: true,
          status: true,
          paymentRef: true,
          notes: true,
          requestedAt: true,
          processedAt: true
        }
      },
      referredUsers: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true
        }
      }
    }
  });

  if (!admin) throw new ApiError(404, 'Partner not found');

  const { password, referredOrders, payouts, referredUsers, ...safe } = admin;
  const paidOrders = referredOrders.filter(o => o.paymentStatus === 'paid');
  const totalSales = paidOrders.reduce((sum, o) => sum + o.subtotal, 0.0);
  const totalCommission = paidOrders.reduce((sum, o) => sum + o.adminCommissionAmount, 0.0);
  const pendingCommission = referredOrders
    .filter(o => o.paymentStatus === 'paid' && o.adminCommissionStatus === 'pending')
    .reduce((sum, o) => sum + o.adminCommissionAmount, 0.0);
  const totalPaidOut = payouts
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + p.amount, 0.0);

  return res.json({
    success: true,
    admin: {
      ...safe,
      stats: {
        totalOrders: referredOrders.length,
        paidOrders: paidOrders.length,
        totalSales: parseFloat(totalSales.toFixed(2)),
        totalCommission: parseFloat(totalCommission.toFixed(2)),
        pendingCommission: parseFloat(pendingCommission.toFixed(2)),
        totalPaidOut: parseFloat(totalPaidOut.toFixed(2)),
        walletBalance: parseFloat((totalCommission - totalPaidOut).toFixed(2)),
        customersCount: referredUsers.length
      },
      referredOrders,
      referredUsers,
      payouts
    }
  });
});

exports.deleteAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // First nullify references in orders so FK constraint doesn't break
  await prisma.order.updateMany({
    where: { adminReferralId: parseInt(id) },
    data: { adminReferralId: null }
  });

  // Delete payouts first
  await prisma.payout.deleteMany({
    where: { adminId: parseInt(id) }
  });

  await prisma.user.delete({ where: { id: parseInt(id) } });

  return res.json({ success: true, message: 'Partner account permanently deleted' });
});

exports.getAllAdmins = asyncHandler(async (req, res) => {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    orderBy: { createdAt: 'desc' },
    include: {
      referredOrders: {
        select: { id: true, subtotal: true, adminCommissionAmount: true, paymentStatus: true }
      }
    }
  });

  const formatted = admins.map(admin => {
    const { password, referredOrders, ...safe } = admin;
    const paidOrders = referredOrders.filter(o => o.paymentStatus === 'paid');
    const totalSales = paidOrders.reduce((sum, o) => sum + o.subtotal, 0.0);
    const totalCommission = paidOrders.reduce((sum, o) => sum + o.adminCommissionAmount, 0.0);

    return {
      ...safe,
      stats: {
        totalOrders: referredOrders.length,
        paidOrders: paidOrders.length,
        totalSales: parseFloat(totalSales.toFixed(2)),
        totalCommission: parseFloat(totalCommission.toFixed(2))
      }
    };
  });

  return res.json({ success: true, admins: formatted });
});

exports.updateAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    commissionPercent, status, orgName, name, phone, email, referralCode,
    upiId, bankName, bankAccount, ifscCode, bankHolder
  } = req.body;

  const data = {
    commissionPercent: commissionPercent !== undefined ? parseFloat(commissionPercent) : undefined,
    status: status !== undefined ? status : undefined,
    orgName: orgName !== undefined ? orgName : undefined,
    name: name !== undefined ? name : undefined,
    phone: phone !== undefined ? phone : undefined,
    upiId: upiId !== undefined ? upiId : undefined,
    bankName: bankName !== undefined ? bankName : undefined,
    bankAccount: bankAccount !== undefined ? bankAccount : undefined,
    ifscCode: ifscCode !== undefined ? ifscCode : undefined,
    bankHolder: bankHolder !== undefined ? bankHolder : undefined
  };

  if (email) data.email = email.toLowerCase().trim();
  if (referralCode) data.referralCode = referralCode.toUpperCase().trim();

  const updated = await prisma.user.update({
    where: { id: parseInt(id) },
    data
  });

  const { password, ...safe } = updated;
  return res.json({ success: true, admin: safe, message: 'Partner details updated successfully' });
});

exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    where: { role: 'USER' },
    orderBy: { createdAt: 'desc' },
    include: {
      referredBy: { select: { id: true, name: true, orgName: true, referralCode: true, phone: true, email: true } },
      orders: {
        select: {
          id: true,
          orderNumber: true,
          finalAmount: true,
          paymentStatus: true,
          orderStatus: true,
          businessName: true,
          adminCommissionAmount: true,
          adminReferralId: true,
          createdAt: true
        }
      }
    }
  });

  const formatted = users.map(user => {
    const { password, orders, referredBy, ...safe } = user;
    const totalSpent = orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.finalAmount, 0.0);

    return {
      ...safe,
      totalOrders: orders.length,
      totalSpent: parseFloat(totalSpent.toFixed(2)),
      referredBy: referredBy
        ? {
            id: referredBy.id,
            name: referredBy.orgName || referredBy.name,
            referralCode: referredBy.referralCode,
            email: referredBy.email,
            phone: referredBy.phone
          }
        : null,
      recentOrders: orders.slice(0, 5)
    };
  });

  return res.json({ success: true, users: formatted });
});

exports.getAllPayouts = asyncHandler(async (req, res) => {
  const payouts = await prisma.payout.findMany({
    orderBy: { requestedAt: 'desc' },
    include: {
      admin: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          orgName: true,
          bankHolder: true,
          bankAccount: true,
          bankName: true,
          ifscCode: true,
          upiId: true
        }
      }
    }
  });

  return res.json({ success: true, payouts });
});

exports.updatePayoutStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, paymentRef, notes } = req.body;

  const updated = await prisma.payout.update({
    where: { id: parseInt(id) },
    data: {
      status,
      paymentRef: paymentRef !== undefined ? paymentRef : undefined,
      notes: notes !== undefined ? notes : undefined,
      processedAt: new Date()
    }
  });

  return res.json({ success: true, payout: updated, message: `Payout marked as ${status}` });
});
