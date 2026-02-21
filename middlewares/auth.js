const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Proteger rutas — verificar JWT
const protect = async (req, res, next) => {
    try {
        let token;

        // Buscar token en header Authorization
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // También buscar en cookies (para el panel admin)
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado. Token no proporcionado.',
            });
        }

        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Buscar usuario
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado. Usuario no encontrado.',
            });
        }

        if (!user.active) {
            return res.status(401).json({
                success: false,
                message: 'Cuenta desactivada.',
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'No autorizado. Token inválido.',
        });
    }
};

// Solo admin
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de administrador.',
    });
};

module.exports = { protect, adminOnly };
