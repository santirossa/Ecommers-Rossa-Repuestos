const { preference, payment } = require('../config/mercadopago');
const Order = require('../models/Order');

// @desc    Crear preferencia de pago para un pedido
// @route   POST /api/payments/create-preference
// @access  Private
const createPreference = async (req, res, next) => {
    try {
        const { orderId } = req.body;

        const order = await Order.findById(orderId).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado.',
            });
        }

        // Verificar que el pedido pertenece al usuario
        if (order.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'No tiene permiso para pagar este pedido.',
            });
        }

        if (order.paymentStatus === 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Este pedido ya fue pagado.',
            });
        }

        // Construir items para Mercado Pago
        const items = order.items.map((item) => ({
            title: item.name,
            unit_price: item.price,
            quantity: item.quantity,
            currency_id: 'ARS',
        }));

        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

        const preferenceData = {
            body: {
                items,
                payer: {
                    name: order.user.name,
                    email: order.user.email,
                },
                back_urls: {
                    success: `${baseUrl}/checkout/success`,
                    failure: `${baseUrl}/checkout/failure`,
                    pending: `${baseUrl}/checkout/pending`,
                },
                auto_return: 'approved',
                external_reference: order._id.toString(),
                notification_url: `${baseUrl}/api/payments/webhook`,
            },
        };

        const response = await preference.create(preferenceData);

        // Guardar ID de preferencia en el pedido
        order.mercadoPagoPreferenceId = response.id;
        await order.save();

        res.json({
            success: true,
            data: {
                preferenceId: response.id,
                initPoint: response.init_point,
                sandboxInitPoint: response.sandbox_init_point,
            },
        });
    } catch (error) {
        console.error('Error al crear preferencia de MercadoPago:', error);
        next(error);
    }
};

// @desc    Webhook de Mercado Pago
// @route   POST /api/payments/webhook
// @access  Public (Mercado Pago)
const webhook = async (req, res, next) => {
    try {
        const { type, data } = req.body;

        if (type === 'payment') {
            // Obtener info del pago
            const paymentInfo = await payment.get({ id: data.id });

            const orderId = paymentInfo.external_reference;
            const order = await Order.findById(orderId);

            if (order) {
                order.paymentId = paymentInfo.id.toString();
                order.paymentStatus = paymentInfo.status; // approved, rejected, pending

                if (paymentInfo.status === 'approved') {
                    order.status = 'pagado';
                } else if (paymentInfo.status === 'rejected') {
                    order.status = 'cancelado';
                    // Devolver stock si el pago fue rechazado
                    const Product = require('../models/Product');
                    for (const item of order.items) {
                        await Product.findByIdAndUpdate(item.product, {
                            $inc: { stock: item.quantity },
                        });
                    }
                }

                await order.save();
            }
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error en webhook de MercadoPago:', error);
        res.status(200).json({ success: true }); // Siempre 200 para MP
    }
};

// @desc    Consultar estado de pago
// @route   GET /api/payments/status/:orderId
// @access  Private
const getPaymentStatus = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado.',
            });
        }

        res.json({
            success: true,
            data: {
                orderId: order._id,
                status: order.status,
                paymentStatus: order.paymentStatus,
                paymentId: order.paymentId,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPreference,
    webhook,
    getPaymentStatus,
};
