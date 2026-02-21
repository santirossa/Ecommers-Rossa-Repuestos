const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { createPreference, webhook, getPaymentStatus } = require('../controllers/paymentController');

router.post('/create-preference', protect, createPreference);
router.post('/webhook', webhook); // Pública — Mercado Pago la llama
router.get('/status/:orderId', protect, getPaymentStatus);

module.exports = router;
