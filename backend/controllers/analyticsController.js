import Visitor from '../models/Visitor.js';
import Order from '../models/Order.js';

// @desc    Track a unique visit
// @route   POST /api/analytics/track
export const trackVisit = async (req, res, next) => {
    try {
        // Get IP from headers (behind proxy) or connection.remoteAddress
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        if (!ip) {
            return res.status(400).json({ error: 'IP address not found' });
        }

        // Upsert to ensure uniqueness and update timestamp
        await Visitor.findOneAndUpdate(
            { ip },
            { lastVisit: new Date() },
            { upsert: true, new: true }
        );

        res.status(200).json({ message: 'Visit tracked' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get dashboard analytics
// @route   GET /api/analytics/stats
export const getStats = async (req, res, next) => {
    try {
        const totalVisitors = await Visitor.countDocuments();
        const totalOrders = await Order.countDocuments();

        // Calculate total sales
        const orders = await Order.find({ status: { $ne: 'cancelled' } });
        const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);

        res.json({
            totalVisitors,
            totalOrders,
            totalSales
        });
    } catch (error) {
        next(error);
    }
};
// @desc    Get detailed business insights
// @route   GET /api/analytics/business-insights
export const getBusinessInsights = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Orders today
        const ordersToday = await Order.countDocuments({
            createdAt: { $gte: today }
        });

        // 2. Top 5 Products by quantity sold (exclude cancelled)
        const topProducts = await Order.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            { $unwind: '$items' },
            { $group: {
                _id: '$items.productId',
                name: { $first: '$items.name' },
                totalQuantity: { $sum: '$items.quantity' },
                totalSales: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
            }},
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 }
        ]);

        // 3. Most Popular Sizes (exclude cancelled)
        const topSizes = await Order.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            { $unwind: '$items' },
            { $group: {
                _id: '$items.size',
                totalQuantity: { $sum: '$items.quantity' }
            }},
            { $sort: { totalQuantity: -1 } },
            { $limit: 8 }
        ]);

        // 4. Daily Orders (Last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const dailyOrders = await Order.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            { $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);

        res.json({
            ordersToday,
            topProducts,
            topSizes,
            dailyOrders
        });
    } catch (error) {
        next(error);
    }
};
