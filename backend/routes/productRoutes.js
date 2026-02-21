const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const upload = require('../middlewares/upload');
const {
    getProducts,
    getAllProductsAdmin,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProduct,
    productValidation,
} = require('../controllers/productController');

// Admin (debe ir ANTES de /:id)
router.get('/admin/all', protect, adminOnly, getAllProductsAdmin);

// Públicas
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', protect, adminOnly, upload.array('images', 5), productValidation, validate, createProduct);
router.put('/:id', protect, adminOnly, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.patch('/:id/toggle', protect, adminOnly, toggleProduct);

module.exports = router;
