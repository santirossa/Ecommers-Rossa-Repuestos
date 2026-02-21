const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middlewares/auth');
const { getDashboardStats } = require('../controllers/statsController');

router.get('/', protect, adminOnly, getDashboardStats);

module.exports = router;
