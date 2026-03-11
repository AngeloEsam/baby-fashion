import Product from '../models/Product.js';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

// Helper to process and save images for performance
const processImages = async (files) => {
    if (!files || files.length === 0) return [];

    const uploadDir = 'uploads/products';
    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    const processedImages = await Promise.all(
        files.map(async (file) => {
            const fileName = `prod-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
            const filePath = path.join(uploadDir, fileName);

            await sharp(file.buffer)
                .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(filePath);

            return `/uploads/products/${fileName}`;
        })
    );

    return processedImages;
};

// @desc    Get all products
// @route   GET /api/products
export const getProducts = async (req, res, next) => {
    try {
        const { category } = req.query;
        const filter = category && category !== 'all' ? { category } : {};
        const products = await Product.find(filter).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
export const getProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new product
// @route   POST /api/products
export const createProduct = async (req, res, next) => {
    try {

        // Check if DB is connected
        if (Product.db.readyState !== 1) {
            return res.status(503).json({
                error: 'Database not connected',
                message: 'You must provide a MONGODB_URI in the .env file to save products.'
            });
        }

        const productData = { ...req.body };

        // Handle uploaded files
        const newImages = await processImages(req.files);

        // If we have uploaded files, use them.
        // If not, use whatever images URL they might have sent in body
        if (newImages.length > 0) {
            productData.images = newImages;
        } else if (typeof productData.images === 'string') {
            productData.images = [productData.images];
        }

        // Convert sizes from string if sent via form-data
        if (typeof productData.sizes === 'string') {
            try {
                productData.sizes = JSON.parse(productData.sizes);
            } catch (e) {
                productData.sizes = productData.sizes.split(',').map(s => s.trim());
            }
        }

        const product = new Product(productData);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
export const updateProduct = async (req, res, next) => {
    try {
        if (Product.db.readyState !== 1) {
            return res.status(503).json({ error: 'Database not connected' });
        }

        const updateData = { ...req.body };

        // Handle images merge/update
        let currentImages = [];
        if (updateData.existingImages) {
            try {
                currentImages = JSON.parse(updateData.existingImages);
            } catch (e) {
                currentImages = Array.isArray(updateData.existingImages) ? updateData.existingImages : [updateData.existingImages];
            }
        }

        // Process new images if uploaded
        const newImages = await processImages(req.files);
        updateData.images = [...currentImages, ...newImages];

        // Convert sizes and numbers from FormData strings
        if (typeof updateData.sizes === 'string') {
            try {
                updateData.sizes = JSON.parse(updateData.sizes);
            } catch (e) {
                updateData.sizes = updateData.sizes.split(',').map(s => s.trim());
            }
        }

        if (updateData.price) updateData.price = Number(updateData.price);
        if (updateData.originalPrice) updateData.originalPrice = Number(updateData.originalPrice);
        if (updateData.isSale) updateData.isSale = updateData.isSale === 'true' || updateData.isSale === true;
        if (updateData.inStock) updateData.inStock = updateData.inStock === 'true' || updateData.inStock === true;

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
export const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Seed sample products
// @route   POST /api/products/seed
export const seedProducts = async (req, res, next) => {
    try {
        const sampleProducts = [
            {
                nameAr: 'فستان أطفال فاخر',
                nameEn: 'Luxury Kids Dress',
                descriptionAr: 'فستان أنيق للأطفال بألوان زاهية ومقاسات مختلفة',
                descriptionEn: 'Elegant dress for kids with vibrant colors and different sizes',
                price: 250,
                originalPrice: 350,
                sizes: ['2-3', '4-5', '6-7', '8-9', '10-11', '12'],
                images: [
                    'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=400',
                    'https://images.unsplash.com/photo-1519238263496-6543b3aa74a9?w=400'
                ],
                category: 'dresses',
                isSale: true
            },
            {
                nameAr: 'بدلة أطفال رسمية',
                nameEn: 'Kids Formal Suit',
                descriptionAr: 'بدلة رسمية للأطفال للمناسبات الخاصة',
                descriptionEn: 'Formal suit for kids for special occasions',
                price: 450,
                originalPrice: 550,
                sizes: ['2-3', '4-5', '6-7', '8-9', '10-11', '12'],
                images: [
                    'https://images.unsplash.com/photo-1519238263496-6543b3aa74a9?w=400',
                    'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=400'
                ],
                category: 'suits',
                isSale: false
            },
            {
                nameAr: 'تيشيرت أطفال كرتون',
                nameEn: 'Cartoon Kids T-Shirt',
                descriptionAr: 'تيشيرت بأشكال كرتونية أطفال يحبونها',
                descriptionEn: 'T-shirt with cartoon designs that kids love',
                price: 120,
                originalPrice: 150,
                sizes: ['2-3', '4-5', '6-7', '8-9', '10-11', '12'],
                images: [
                    'https://images.unsplash.com/photo-1621452773781-0f992fd1f5cb?w=400',
                    'https://images.unsplash.com/photo-1559563362-c667ba5f5480?w=400'
                ],
                category: 'tshirts',
                isSale: true
            },
            {
                nameAr: 'جاكيت أطفال شتوي',
                nameEn: 'Kids Winter Jacket',
                descriptionAr: 'جاكيت دافئ للأطفال لفصل الشتاء',
                descriptionEn: 'Warm jacket for kids for winter season',
                price: 380,
                originalPrice: 480,
                sizes: ['2-3', '4-5', '6-7', '8-9', '10-11', '12'],
                images: [
                    'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=400',
                    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400'
                ],
                category: 'jackets',
                isSale: true
            },
            {
                nameAr: 'بناطيل أطفال جينز',
                nameEn: 'Kids Jeans Pants',
                descriptionAr: 'بناطيل جينز مريحة للأطفال',
                descriptionEn: 'Comfortable jeans for kids',
                price: 180,
                originalPrice: 220,
                sizes: ['2-3', '4-5', '6-7', '8-9', '10-11', '12'],
                images: [
                    'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
                    'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=400'
                ],
                category: 'pants',
                isSale: false
            },
            {
                nameAr: 'فستان أطفال وردي',
                nameEn: 'Pink Kids Dress',
                descriptionAr: 'فستان وردي جميل للأطفال',
                descriptionEn: 'Beautiful pink dress for kids',
                price: 280,
                originalPrice: 350,
                sizes: ['2-3', '4-5', '6-7', '8-9', '10-11', '12'],
                images: [
                    'https://images.unsplash.com/photo-1519238263496-6543b3aa74a9?w=400',
                    'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=400'
                ],
                category: 'dresses',
                isSale: true
            },
            {
                nameAr: 'بلوزة أطفال مزينة',
                nameEn: 'Decorative Kids Blouse',
                descriptionAr: 'بلوزة أنيقة للأطفال بتصميم عصري',
                descriptionEn: 'Elegant blouse for kids with modern design',
                price: 160,
                originalPrice: 200,
                sizes: ['2-3', '4-5', '6-7', '8-9', '10-11', '12'],
                images: [
                    'https://images.unsplash.com/photo-1559563362-c667ba5f5480?w=400',
                    'https://images.unsplash.com/photo-1621452773781-0f992fd1f5cb?w=400'
                ],
                category: 'tshirts',
                isSale: true
            },
            {
                nameAr: 'معطف أطفال كلاسيك',
                nameEn: 'Classic Kids Coat',
                descriptionAr: 'معطف كلاسيكي أنيق للأطفال',
                descriptionEn: 'Elegant classic coat for kids',
                price: 520,
                originalPrice: 650,
                sizes: ['2-3', '4-5', '6-7', '8-9', '10-11', '12'],
                images: [
                    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400',
                    'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=400'
                ],
                category: 'jackets',
                isSale: true
            }
        ];

        await Product.deleteMany({});
        const products = await Product.insertMany(sampleProducts);
        res.json({ message: `${products.length} products seeded successfully`, products });
    } catch (error) {
        next(error);
    }
};

// @desc    Search products
// @route   GET /api/products/search
export const searchProducts = async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.json([]);
        }

        const products = await Product.find(
            { $text: { $search: q } },
            { score: { $meta: 'textScore' } }
        ).sort({ score: { $meta: 'textScore' } });

        res.json(products);
    } catch (error) {
        next(error);
    }
};
