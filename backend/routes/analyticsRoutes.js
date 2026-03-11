import express from 'express';
import { trackVisit, getStats, getBusinessInsights } from '../controllers/analyticsController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Public route to track visits
router.post('/track', trackVisit);

// Protected route for dashboard stats
router.get('/stats', auth, getStats);
router.get('/business-insights', auth, getBusinessInsights);


export default router;
