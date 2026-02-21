const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'El nombre es obligatorio'],
            trim: true,
            maxlength: [100, 'El nombre no puede superar los 100 caracteres'],
        },
        email: {
            type: String,
            required: [true, 'El email es obligatorio'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
        },
        password: {
            type: String,
            required: [true, 'La contraseña es obligatoria'],
            minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
            select: false,
        },
        role: {
            type: String,
            enum: ['admin', 'cliente'],
            default: 'cliente',
        },
        phone: {
            type: String,
            trim: true,
            default: '',
        },
        address: {
            street: { type: String, default: '' },
            city: { type: String, default: '' },
            province: { type: String, default: '' },
            zipCode: { type: String, default: '' },
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Hash password antes de guardar
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Comparar password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Eliminar password del JSON
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

module.exports = mongoose.model('User', userSchema);
