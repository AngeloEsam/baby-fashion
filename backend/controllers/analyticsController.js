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
