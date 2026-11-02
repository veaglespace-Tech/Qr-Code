const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const asyncHandler = require('../utils/asyncHandler');
const {
  sendOrderConfirmationEmail,
  sendNewOrderAdminAlert,
  sendPartnerCommissionAlert
} = require('../utils/mailer');

router.post('/response', asyncHandler(async (req, res) => {
  const {
    status,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    udf1: orderId,
    hash: responseHash,
    mihpayid
  } = req.body;

  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { id: isNaN(orderId) ? undefined : parseInt(orderId) },
        { payuTxnId: txnid }
      ]
    }
  });

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

  if (!order) {
    return res.redirect(`${clientUrl}/checkout?error=order_not_found`);
  }

  if (status === 'success') {
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'paid',
        orderStatus: 'customizing',
        payuMihPayId: mihpayid || '',
        adminCommissionStatus: order.adminReferralId ? 'approved' : null
      },
      include: { user: true }
    });

    // Trigger online order confirmation emails
    const items = updatedOrder.items ? (typeof updatedOrder.items === 'string' ? JSON.parse(updatedOrder.items) : updatedOrder.items) : [];
    sendOrderConfirmationEmail(updatedOrder, items).catch(err => console.error('[PayU Order Confirmation Email Error]', err));
    sendNewOrderAdminAlert(updatedOrder, items).catch(err => console.error('[PayU Admin Order Alert Error]', err));
    if (updatedOrder.adminReferralId && updatedOrder.adminCommissionAmount > 0) {
      prisma.user.findUnique({ where: { id: updatedOrder.adminReferralId } }).then(partner => {
        if (partner) sendPartnerCommissionAlert(partner, updatedOrder, updatedOrder.adminCommissionAmount);
      }).catch(err => console.error('[PayU Partner Commission Alert Error]', err));
    }

    // Ensure session cookie is set so customer immediately sees their orders in customer portal
    if (updatedOrder.user) {
      const jwt = require('jsonwebtoken');
      const jwtSecret = process.env.JWT_KEY || process.env.JWT_SECRET || 'secret';
      const token = jwt.sign(
        { id: updatedOrder.user.id, email: updatedOrder.user.email, role: updatedOrder.user.role, name: updatedOrder.user.name },
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

    return res.redirect(`${clientUrl}/checkout/success?orderId=${order.id}`);
  } else {
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: 'failed' }
    });
    return res.redirect(`${clientUrl}/checkout?error=payment_failed&orderId=${order.id}`);
  }
}));

module.exports = router;
