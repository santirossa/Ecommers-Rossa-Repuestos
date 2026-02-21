const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    console.error('❌ Error:', err);

    // Mongoose: ID inválido
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Recurso no encontrado. ID inválido.',
        });
    }

    // Mongoose: Campo duplicado
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            success: false,
            message: `El valor del campo '${field}' ya existe.`,
        });
    }

    // Mongoose: Validación
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((val) => val.message);
        return res.status(400).json({
            success: false,
            message: messages.join('. '),
        });
    }

    // JWT expirado
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expirado. Vuelva a iniciar sesión.',
        });
    }

    // JWT inválido
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Token inválido.',
        });
    }

    // Error por defecto
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
    });
};

module.exports = errorHandler;
