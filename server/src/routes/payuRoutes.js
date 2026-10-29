const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const asyncHandler = require('../utils/asyncHandler');

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
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'paid',
        orderStatus: 'customizing',
        payuMihPayId: mihpayid || '',
        adminCommissionStatus: order.adminReferralId ? 'approved' : null
      }
    });
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
