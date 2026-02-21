const { body } = require('express-validator');
const Category = require('../models/Category');

// @desc    Obtener todas las categorías (público)
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
    try {
        const query = req.query.all === 'true' ? {} : { active: true };
        const categories = await Category.find(query).sort('name');

        res.json({
            success: true,
            data: { categories },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obtener categoría por ID
// @route   GET /api/categories/:id
// @access  Public
const getCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada.',
            });
        }

        res.json({
            success: true,
            data: { category },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Crear categoría
// @route   POST /api/categories
// @access  Admin
const createCategory = async (req, res, next) => {
    try {
        const { name, description } = req.body;

        const category = await Category.create({
            name,
            description,
        });

        res.status(201).json({
            success: true,
            message: 'Categoría creada exitosamente.',
            data: { category },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Actualizar categoría
// @route   PUT /api/categories/:id
// @access  Admin
const updateCategory = async (req, res, next) => {
    try {
        const { name, description, active } = req.body;
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada.',
            });
        }

        if (name !== undefined) category.name = name;
        if (description !== undefined) category.description = description;
        if (active !== undefined) category.active = active;

        await category.save();

        res.json({
            success: true,
            message: 'Categoría actualizada exitosamente.',
            data: { category },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Eliminar categoría
// @route   DELETE /api/categories/:id
// @access  Admin
const deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada.',
            });
        }

        await Category.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Categoría eliminada exitosamente.',
        });
    } catch (error) {
        next(error);
    }
};

// Validaciones
const categoryValidation = [
    body('name').notEmpty().withMessage('El nombre de la categoría es obligatorio').trim(),
];

module.exports = {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    categoryValidation,
};
