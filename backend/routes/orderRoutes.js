const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
    createOrder,
    getMyOrders,
    getAllOrders,
    getOrder,
    updateOrderStatus,
    orderValidation,
} = require('../controllers/orderController');

router.post('/', protect, orderValidation, validate, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/', protect, adminOnly, getAllOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
