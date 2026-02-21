const { body } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Crear pedido
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
    try {
        const { items, shippingAddress, notes } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'El pedido debe contener al menos un producto.',
            });
        }

        // Verificar stock y construir items con precios actuales
        const orderItems = [];
        let total = 0;

        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Producto ${item.product} no encontrado.`,
                });
            }
            if (!product.active) {
                return res.status(400).json({
                    success: false,
                    message: `El producto "${product.name}" no está disponible.`,
                });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Stock insuficiente para "${product.name}". Disponible: ${product.stock}.`,
                });
            }

            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                image: product.images.length > 0 ? product.images[0] : '',
            });

            total += product.price * item.quantity;

            // Descontar stock
            product.stock -= item.quantity;
            await product.save();
        }

        const order = await Order.create({
            user: req.user._id,
            items: orderItems,
            total,
            shippingAddress: shippingAddress || req.user.address,
            notes,
        });

        await order.populate('user', 'name email phone');

        res.status(201).json({
            success: true,
            message: 'Pedido creado exitosamente.',
            data: { order },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obtener pedidos del usuario
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort('-createdAt')
            .populate('items.product', 'name images');

        res.json({
            success: true,
            data: { orders },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obtener todos los pedidos (admin)
// @route   GET /api/orders
// @access  Admin
const getAllOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const query = {};

        if (status) query.status = status;

        const total = await Order.countDocuments(query);
        const orders = await Order.find(query)
            .populate('user', 'name email phone')
            .sort('-createdAt')
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        res.json({
            success: true,
            data: {
                orders,
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

// @desc    Obtener pedido por ID
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email phone')
            .populate('items.product', 'name images');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado.',
            });
        }

        // Solo el dueño o admin puede ver
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No tiene permiso para ver este pedido.',
            });
        }

        res.json({
            success: true,
            data: { order },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Actualizar estado del pedido
// @route   PUT /api/orders/:id/status
// @access  Admin
const updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pendiente', 'pagado', 'preparando', 'enviado', 'entregado', 'cancelado'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Estado inválido. Opciones: ${validStatuses.join(', ')}`,
            });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado.',
            });
        }

        // Si se cancela, devolver stock
        if (status === 'cancelado' && order.status !== 'cancelado') {
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: item.quantity },
                });
            }
        }

        order.status = status;
        await order.save();

        res.json({
            success: true,
            message: `Estado actualizado a "${status}".`,
            data: { order },
        });
    } catch (error) {
        next(error);
    }
};

// Validaciones
const orderValidation = [
    body('items').isArray({ min: 1 }).withMessage('Debe enviar al menos un item'),
    body('items.*.product').notEmpty().withMessage('El ID del producto es obligatorio'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('La cantidad debe ser al menos 1'),
];

module.exports = {
    createOrder,
    getMyOrders,
    getAllOrders,
    getOrder,
    updateOrderStatus,
    orderValidation,
};
