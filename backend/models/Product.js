import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    nameAr: {
        type: String,
        required: [true, 'Arabic name is required'],
        trim: true
    },
    nameEn: {
        type: String,
        required: [true, 'English name is required'],
        trim: true
    },
    descriptionAr: {
        type: String,
        trim: true
    },
    descriptionEn: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    originalPrice: {
        type: Number,
        min: [0, 'Original price cannot be negative']
    },
    sizes: [{
        type: String,
        trim: true
    }],
    images: [{
        type: String,
        trim: true
    }],
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['dresses', 'suits', 'tshirts', 'jackets', 'pants'],
        default: 'dresses'
    },
    isSale: {
        type: Boolean,
        default: false
    },
    inStock: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);

export default Product;
