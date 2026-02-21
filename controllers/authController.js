const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');

// Generar JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

// @desc    Registrar usuario
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;

        // Verificar si ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El email ya está registrado.',
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            phone,
            role: 'cliente', // Siempre cliente por registro público
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente.',
            data: { user, token },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Buscar usuario con password
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas.',
            });
        }

        if (!user.active) {
            return res.status(401).json({
                success: false,
                message: 'Cuenta desactivada. Contacte al administrador.',
            });
        }

        // Verificar password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas.',
            });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login exitoso.',
            data: { user, token },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obtener perfil
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({
            success: true,
            data: { user },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Actualizar perfil
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
    try {
        const { name, phone, address } = req.body;
        const user = await User.findById(req.user._id);

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (address) user.address = address;

        await user.save();

        res.json({
            success: true,
            message: 'Perfil actualizado.',
            data: { user },
        });
    } catch (error) {
        next(error);
    }
};

// Validaciones
const registerValidation = [
    body('name').notEmpty().withMessage('El nombre es obligatorio').trim(),
    body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres'),
];

const loginValidation = [
    body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
];

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    registerValidation,
    loginValidation,
};
