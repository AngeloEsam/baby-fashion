import Order from '../models/Order.js';
import telegramService from '../services/telegramService.js';

// @desc    Create a new order
// @route   POST /api/orders
export const createOrder = async (req, res, next) => {
    try {
        console.log('📦 Global: Incoming order request from:', req.body.customerName);
        if (Order.db.readyState !== 1) {
            return res.status(503).json({
                error: 'Database not connected',
                message: 'Orders cannot be placed without a MongoDB connection.'
            });
        }

        const { customerName, phone, location, notes, items, totalAmount } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Order must have at least one item' });
        }

        const order = new Order({
            customerName,
            phone,
            location,
            notes,
            items,
            totalAmount
        });

        await order.save();

        // Send Telegram notification (non-blocking)
        telegramService.sendOrderNotification(order).catch(err => {
            console.error('⚠️ Post-save task failed:', err.message);
        });

        res.status(201).json(order);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
export const getOrders = async (req, res, next) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        const orders = await Order.find(filter).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
export const getOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        next(error);
    }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id
export const updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (status && !['pending', 'confirmed', 'delivered', 'cancelled'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Notify admin of status change
        telegramService.sendStatusUpdateNotification(order).catch(() => { });

        res.json(order);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete an order
// @route   DELETE /api/orders/:id
export const deleteOrder = async (req, res, next) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        next(error);
    }
};
