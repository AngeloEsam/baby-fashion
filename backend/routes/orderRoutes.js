import { Router } from 'express';
import auth from '../middleware/auth.js';
import {
    createOrder,
    getOrders,
    getOrder,
    updateOrderStatus,
    deleteOrder
} from '../controllers/orderController.js';

const router = Router();

router.route('/')
    .get(auth, getOrders)
    .post(createOrder);

router.route('/:id')
    .get(auth, getOrder)
    .patch(auth, updateOrderStatus)
    .delete(auth, deleteOrder);

export default router;
