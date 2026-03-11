import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useWishlist } from '../context/WishlistContext';
import { Product } from '../types';
import { translations } from '../i18n/translations';
import { IMAGE_BASE_URL, WHATSAPP_NUMBER } from '../api/config';

// Helper to resolve image paths (local vs external)
export const getImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${IMAGE_BASE_URL}${path}`;
};


interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
}

export function ProductCard({ product, onProductClick }: ProductCardProps) {
  const { language, addToCart } = useApp();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || '');
  const [showSizeAlert, setShowSizeAlert] = useState(false);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.ar] || key;
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.inStock) return;
    if (!selectedSize) {
      setShowSizeAlert(true);
      setTimeout(() => setShowSizeAlert(false), 2000);
      return;
    }
    addToCart(product, selectedSize);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div
      className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 cursor-pointer"
      onClick={() => onProductClick(product)}
    >
      {/* Image Section */}
      <div className="relative aspect-4/5 overflow-hidden bg-gray-100 dark:bg-gray-700">
        <img
          src={getImageUrl(product.images[0])}
          alt={language === 'ar' ? product.nameAr : product.nameEn}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
        />

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isInWishlist(product._id)) {
              removeFromWishlist(product._id);
            } else {
              addToWishlist(product);
            }
          }}
          className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-all duration-300 z-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 ${isInWishlist(product._id) ? 'text-red-500' : ''}`}
            fill={isInWishlist(product._id) ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.682l1.318-1.364a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
            />
          </svg>
        </button>

        {/* Sale Badge */}
        {product.isSale && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full animate-pulse">
            {t('sale')} {discount}%
          </div>
        )}

        {/* Multiple Images Indicator */}
        {product.images.length > 1 && (
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/50 text-white text-xs rounded-full backdrop-blur-sm">
            📷 {product.images.length}
          </div>
        )}

        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`px-6 py-3 font-semibold rounded-full transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 ${product.inStock
                ? 'bg-white text-[#3D5EA5] hover:bg-[#E4DFCA]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            {product.inStock ? t('addToCart') : t('outOfStock')}
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 line-clamp-1">
          {language === 'ar' ? product.nameAr : product.nameEn}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl font-bold text-[#3D5EA5] dark:text-[#7B9FD4]">
            {product.price} {language === 'ar' ? 'ج.م' : 'EGP'}
          </span>
          {product.isSale && product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-400 line-through">
              {product.originalPrice} {language === 'ar' ? 'ج.م' : 'EGP'}
            </span>
          )}
        </div>

        {/* Sizes */}
        <div className="mb-3">
          <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">
            {t('sizes')}:
          </label>
          <div className="flex flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-2 py-1 text-xs rounded-lg transition-colors ${selectedSize === size
                  ? 'bg-[#3D5EA5] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-[#E4DFCA] dark:hover:bg-[#3D5EA5]/30'
                  }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Add to Cart Button */}
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="flex-1 py-3 bg-linear-to-r from-[#3D5EA5] to-[#2E3A42] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#3D5EA5]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {product.inStock ? t('addToCart') : t('outOfStock')}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const message = t('whatsappMessage')
                .replace('{name}', language === 'ar' ? product.nameAr : product.nameEn)
                .replace('{size}', selectedSize || product.sizes[0] || '-')
                .replace('{price}', product.price.toString());
              const encodedMessage = encodeURIComponent(message);
              window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
            }}
            className="w-12 h-12 flex items-center justify-center bg-green-500 text-white rounded-xl shadow-lg shadow-green-500/30 hover:bg-green-600 transition-all transform hover:scale-[1.05] active:scale-[0.95]"
            title={t('orderWhatsApp')}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </button>
        </div>

        {/* Size Alert */}
        {showSizeAlert && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-500 text-white rounded-xl shadow-lg animate-bounce z-50">
            {t('selectSize')}
          </div>
        )}
      </div>
    </div>
  );
}
