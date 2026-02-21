const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'El nombre del producto es obligatorio'],
            trim: true,
            maxlength: [200, 'El nombre no puede superar los 200 caracteres'],
        },
        description: {
            type: String,
            required: [true, 'La descripción es obligatoria'],
            maxlength: [2000, 'La descripción no puede superar los 2000 caracteres'],
        },
        price: {
            type: Number,
            required: [true, 'El precio es obligatorio'],
            min: [0, 'El precio no puede ser negativo'],
        },
        stock: {
            type: Number,
            required: [true, 'El stock es obligatorio'],
            min: [0, 'El stock no puede ser negativo'],
            default: 0,
        },
        images: [
            {
                type: String,
            },
        ],
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'La categoría es obligatoria'],
        },
        brand: {
            type: String,
            default: 'IVECO',
            trim: true,
        },
        partNumber: {
            type: String,
            trim: true,
            default: '',
        },
        compatibleModels: {
            type: String,
            trim: true,
            default: '',
        },
        active: {
            type: Boolean,
            default: true,
        },
        featured: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Índices para búsqueda
productSchema.index({ name: 'text', description: 'text', partNumber: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ active: 1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model('Product', productSchema);
