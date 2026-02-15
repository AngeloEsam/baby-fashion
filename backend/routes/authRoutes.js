import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Admin Login
router.post('/login', async (req, res) => {
    try {
        const { password } = req.body;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (password === adminPassword) {
            const token = jwt.sign(
                { role: 'admin' },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            res.json({ token });
        } else {
            res.status(401).json({ error: 'Incorrect password' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
