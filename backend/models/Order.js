const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'La cantidad mínima es 1'],
        },
        image: {
            type: String,
            default: '',
        },
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: [orderItemSchema],
        total: {
            type: Number,
            required: true,
            min: [0, 'El total no puede ser negativo'],
        },
        status: {
            type: String,
            enum: ['pendiente', 'pagado', 'preparando', 'enviado', 'entregado', 'cancelado'],
            default: 'pendiente',
        },
        paymentId: {
            type: String,
            default: '',
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'refunded', ''],
            default: '',
        },
        mercadoPagoPreferenceId: {
            type: String,
            default: '',
        },
        shippingAddress: {
            street: { type: String, default: '' },
            city: { type: String, default: '' },
            province: { type: String, default: '' },
            zipCode: { type: String, default: '' },
        },
        notes: {
            type: String,
            default: '',
            maxlength: [500, 'Las notas no pueden superar los 500 caracteres'],
        },
    },
    {
        timestamps: true,
    }
);

// Índices
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
