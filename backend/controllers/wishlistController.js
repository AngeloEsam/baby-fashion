
import Wishlist from '../models/Wishlist.js';
import Visitor from '../models/Visitor.js';

// Get wishlist for a visitor
export const getWishlist = async (req, res) => {
    try {
        const visitorId = req.headers['x-visitor-id'];
        if (!visitorId) {
            return res.status(400).json({ error: 'Visitor ID required' });
        }

        let visitor = await Visitor.findOne({ visitorId });

        if (!visitor) {
            visitor = new Visitor({ visitorId, ip: req.ip });
            await visitor.save();
        }

        const wishlist = await Wishlist.findOne({ visitorId: visitor._id }).populate('products');
        if (!wishlist) {
            return res.json([]);
        }

        res.json(wishlist.products);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Add a product to the wishlist
export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const visitorId = req.headers['x-visitor-id'];
        if (!visitorId) {
            return res.status(400).json({ error: 'Visitor ID required' });
        }

        let visitor = await Visitor.findOne({ visitorId });

        if (!visitor) {
            visitor = new Visitor({ visitorId, ip: req.ip });
            await visitor.save();
        }

        let wishlist = await Wishlist.findOne({ visitorId: visitor._id });

        if (!wishlist) {
            wishlist = new Wishlist({ visitorId: visitor._id, products: [productId] });
        } else {
            if (!wishlist.products.includes(productId)) {
                wishlist.products.push(productId);
            }
        }

        await wishlist.save();
        res.status(201).json(wishlist);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Remove a product from the wishlist
export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const visitorId = req.headers['x-visitor-id'];
        const visitor = await Visitor.findOne({ visitorId });

        if (visitor) {
            await Wishlist.updateOne(
                { visitorId: visitor._id },
                { $pull: { products: productId } }
            );
        }

        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};
