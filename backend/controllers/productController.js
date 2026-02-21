const { body } = require('express-validator');
const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

// @desc    Obtener todos los productos (público — solo activos)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 12,
            category,
            search,
            minPrice,
            maxPrice,
            sort = '-createdAt',
            featured,
        } = req.query;

        const query = { active: true };

        // Filtros
        if (category) query.category = category;
        if (featured === 'true') query.featured = true;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (search) {
            query.$text = { $search: search };
        }

        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .populate('category', 'name slug')
            .sort(sort)
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        res.json({
            success: true,
            data: {
                products,
                pagination: {
                    current: Number(page),
                    pages: Math.ceil(total / Number(limit)),
                    total,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obtener todos (admin — incluye inactivos)
// @route   GET /api/products/admin/all
// @access  Admin
const getAllProductsAdmin = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search, category, active } = req.query;
        const query = {};

        if (category) query.category = category;
        if (active !== undefined) query.active = active === 'true';
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { partNumber: { $regex: search, $options: 'i' } },
            ];
        }

        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .populate('category', 'name slug')
            .sort('-createdAt')
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        res.json({
            success: true,
            data: {
                products,
                pagination: {
                    current: Number(page),
                    pages: Math.ceil(total / Number(limit)),
                    total,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obtener producto por ID
// @route   GET /api/products/:id
// @access  Public
const getProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name slug');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado.',
            });
        }

        res.json({
            success: true,
            data: { product },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Crear producto
// @route   POST /api/products
// @access  Admin
const createProduct = async (req, res, next) => {
    try {
        const { name, description, price, stock, category, brand, partNumber, compatibleModels, active, featured } = req.body;

        // Procesar imágenes subidas
        const images = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach((file) => {
                images.push(`/uploads/${file.filename}`);
            });
        }

        const product = await Product.create({
            name,
            description,
            price,
            stock,
            images,
            category,
            brand: brand || 'IVECO',
            partNumber,
            compatibleModels,
            active: active !== undefined ? active : true,
            featured: featured === 'true' || featured === true,
        });

        await product.populate('category', 'name slug');

        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente.',
            data: { product },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Actualizar producto
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = async (req, res, next) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado.',
            });
        }

        const { name, description, price, stock, category, brand, partNumber, compatibleModels, active, featured, removeImages } = req.body;

        // Actualizar campos
        if (name !== undefined) product.name = name;
        if (description !== undefined) product.description = description;
        if (price !== undefined) product.price = price;
        if (stock !== undefined) product.stock = stock;
        if (category !== undefined) product.category = category;
        if (brand !== undefined) product.brand = brand;
        if (partNumber !== undefined) product.partNumber = partNumber;
        if (compatibleModels !== undefined) product.compatibleModels = compatibleModels;
        if (active !== undefined) product.active = active === 'true' || active === true;
        if (featured !== undefined) product.featured = featured === 'true' || featured === true;

        // Eliminar imágenes seleccionadas
        if (removeImages) {
            const toRemove = Array.isArray(removeImages) ? removeImages : [removeImages];
            toRemove.forEach((img) => {
                const filePath = path.join(__dirname, '..', img);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                product.images = product.images.filter((i) => i !== img);
            });
        }

        // Agregar nuevas imágenes
        if (req.files && req.files.length > 0) {
            req.files.forEach((file) => {
                product.images.push(`/uploads/${file.filename}`);
            });
        }

        await product.save();
        await product.populate('category', 'name slug');

        res.json({
            success: true,
            message: 'Producto actualizado exitosamente.',
            data: { product },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Eliminar producto
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado.',
            });
        }

        // Eliminar imágenes del disco
        product.images.forEach((img) => {
            const filePath = path.join(__dirname, '..', img);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        await Product.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Producto eliminado exitosamente.',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Activar/Desactivar producto
// @route   PATCH /api/products/:id/toggle
// @access  Admin
const toggleProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado.',
            });
        }

        product.active = !product.active;
        await product.save();

        res.json({
            success: true,
            message: `Producto ${product.active ? 'activado' : 'desactivado'} exitosamente.`,
            data: { product },
        });
    } catch (error) {
        next(error);
    }
};

// Validaciones
const productValidation = [
    body('name').notEmpty().withMessage('El nombre es obligatorio').trim(),
    body('description').notEmpty().withMessage('La descripción es obligatoria').trim(),
    body('price').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
    body('stock').isInt({ min: 0 }).withMessage('El stock debe ser un número entero positivo'),
    body('category').notEmpty().withMessage('La categoría es obligatoria'),
];

module.exports = {
    getProducts,
    getAllProductsAdmin,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProduct,
    productValidation,
};
