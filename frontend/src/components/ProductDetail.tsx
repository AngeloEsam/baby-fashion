import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';
import { Product } from '../types';
import clsx from 'clsx';
import { getImageUrl } from './ProductCard';



interface ProductDetailProps {
    product: Product;
    onBack: () => void;
}

export function ProductDetail({ product, onBack }: ProductDetailProps) {
    const { language, addToCart } = useApp();
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState(product.sizes[0] || '');
    const [showSizeAlert, setShowSizeAlert] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);

    const t = (key: string): string => {
        return translations[language][key as keyof typeof translations.ar] || key;
    };

    const handleAddToCart = () => {
        if (!selectedSize) {
            setShowSizeAlert(true);
            setTimeout(() => setShowSizeAlert(false), 2000);
            return;
        }
        addToCart(product, selectedSize);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const discount = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    const productName = language === 'ar' ? product.nameAr : product.nameEn;
    const productDescription = language === 'ar' ? product.descriptionAr : product.descriptionEn;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12 transition-colors">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="group flex items-center gap-2 mb-8 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-[#3D5EA5] dark:hover:text-[#7B9FD4] transition-colors rounded-xl hover:bg-white dark:hover:bg-gray-800 shadow-sm hover:shadow-md"
                >
                    <svg
                        className="w-5 h-5 transition-transform group-hover:-translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="font-medium">{t('backToProducts')}</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-inner">
                            <img
                                src={getImageUrl(product.images[selectedImage] || product.images[0])}
                                alt={productName}
                                className="w-full h-full object-cover transition-opacity duration-300"
                                loading="lazy"
                            />
                            {product.isSale && (
                                <div className="absolute top-4 left-4 px-4 py-1.5 bg-red-500 text-white text-sm font-bold rounded-full shadow-lg animate-pulse">
                                    {t('sale')} {discount}%
                                </div>
                            )}
                            {!product.inStock && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <span className="text-white text-2xl font-bold bg-red-500/80 px-6 py-3 rounded-xl">
                                        {t('outOfStock')}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {product.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-3">
                                {product.images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={clsx(
                                            "relative aspect-[4/5] rounded-xl overflow-hidden border-2 transition-all duration-300",
                                            selectedImage === index
                                                ? "border-[#3D5EA5] scale-95 shadow-lg"
                                                : "border-transparent hover:border-gray-200"
                                        )}
                                    >
                                        <img
                                            src={getImageUrl(img)}
                                            alt={`${productName} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col justify-center space-y-6">
                        {/* Name */}
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                {productName}
                            </h1>
                            {productDescription && (
                                <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
                                    {productDescription}
                                </p>
                            )}
                        </div>

                        {/* Price Section */}
                        <div className="flex items-baseline gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                            <span className="text-4xl font-bold text-[#3D5EA5] dark:text-[#7B9FD4]">
                                {product.price} {language === 'ar' ? 'ج.م' : 'EGP'}
                            </span>
                            {product.isSale && product.originalPrice && product.originalPrice > product.price && (
                                <div className="flex flex-col">
                                    <span className="text-lg text-gray-400 line-through">
                                        {product.originalPrice} {language === 'ar' ? 'ج.م' : 'EGP'}
                                    </span>
                                    <span className="text-sm text-green-500 font-semibold">
                                        {language === 'ar' ? `وفر ${discount}%` : `Save ${discount}%`}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Size Selector */}
                        <div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block uppercase tracking-wider">
                                {t('sizes')}
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {product.sizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${selectedSize === size
                                            ? 'bg-gradient-to-r from-[#3D5EA5] to-[#2E3A42] text-white shadow-lg shadow-[#3D5EA5]/30 scale-105'
                                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-[#3D5EA5]/50 dark:hover:border-[#3D5EA5] hover:bg-[#E4DFCA]/30 dark:hover:bg-[#3D5EA5]/20'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            disabled={!product.inStock}
                            className={`w-full py-4 text-lg font-bold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${addedToCart
                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                                : 'bg-gradient-to-r from-[#3D5EA5] to-[#2E3A42] text-white shadow-lg shadow-[#3D5EA5]/30 hover:shadow-xl hover:shadow-[#3D5EA5]/40'
                                } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                        >
                            {addedToCart
                                ? (language === 'ar' ? '✓ تمت الإضافة!' : '✓ Added!')
                                : product.inStock
                                    ? t('addToCart')
                                    : t('outOfStock')
                            }
                        </button>
                    </div>
                </div>
            </div>

            {/* Size Alert */}
            {showSizeAlert && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-500 text-white rounded-xl shadow-lg animate-bounce z-50">
                    {t('selectSize')}
                </div>
            )}
        </div>
    );
}
