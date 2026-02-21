const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    categoryValidation,
} = require('../controllers/categoryController');

// Públicas
router.get('/', getCategories);
router.get('/:id', getCategory);

// Admin
router.post('/', protect, adminOnly, categoryValidation, validate, createCategory);
router.put('/:id', protect, adminOnly, updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

module.exports = router;
