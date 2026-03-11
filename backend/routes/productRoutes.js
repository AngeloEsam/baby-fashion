import { Router } from 'express';
import upload from '../middleware/upload.js';
import auth from '../middleware/auth.js';
import {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    seedProducts
} from '../controllers/productController.js';

const router = Router();

router.route('/')
    .get(getProducts)
    .post(auth, upload.array('images', 5), createProduct);

router.post('/seed', auth, seedProducts);

router.get('/search', searchProducts);

router.route('/:id')
    .get(getProduct)
    .put(auth, upload.array('images', 5), updateProduct)
    .delete(auth, deleteProduct);

export default router;
