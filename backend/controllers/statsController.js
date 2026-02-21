const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Obtener estadísticas del dashboard
// @route   GET /api/stats
// @access  Admin
const getDashboardStats = async (req, res, next) => {
    try {
        const [totalProducts, activeProducts, totalOrders, totalUsers] = await Promise.all([
            Product.countDocuments(),
            Product.countDocuments({ active: true }),
            Order.countDocuments(),
            User.countDocuments({ role: 'cliente' }),
        ]);

        // Ingresos totales (solo pedidos pagados)
        const revenueResult = await Order.aggregate([
            { $match: { status: { $in: ['pagado', 'preparando', 'enviado', 'entregado'] } } },
            { $group: { _id: null, total: { $sum: '$total' } } },
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Pedidos por estado
        const ordersByStatus = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        // Últimos 5 pedidos
        const recentOrders = await Order.find()
            .populate('user', 'name email')
            .sort('-createdAt')
            .limit(5);

        // Productos con bajo stock (menos de 5)
        const lowStockProducts = await Product.find({ stock: { $lte: 5 }, active: true })
            .select('name stock partNumber')
            .sort('stock')
            .limit(10);

        res.json({
            success: true,
            data: {
                totalProducts,
                activeProducts,
                totalOrders,
                totalUsers,
                totalRevenue,
                ordersByStatus: ordersByStatus.reduce((acc, curr) => {
                    acc[curr._id] = curr.count;
                    return acc;
                }, {}),
                recentOrders,
                lowStockProducts,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getDashboardStats };
