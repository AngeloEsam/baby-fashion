import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';
import { getImageUrl } from './ProductCard';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function CartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
  const { language, cart, removeFromCart, updateQuantity, cartTotal } = useApp();

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.ar] || key;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white dark:bg-gray-900 shadow-2xl animate-slide-in-left">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              {t('yourCart')}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-24 h-24 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  {t('emptyCart')}
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-6 py-2 bg-[#3D5EA5] text-white rounded-full hover:bg-[#2E3A42] transition-colors"
                >
                  {t('continueShopping')}
                </button>
              </div>
            ) : (
              cart.map((item, index) => (
                <div
                  key={`${item.product._id}-${item.size}`}
                  className="flex gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl animate-fade-in-up"
                >
                  {/* Image */}
                  <img
                    src={getImageUrl(item.product.images[0])}
                    alt={language === 'ar' ? item.product.nameAr : item.product.nameEn}
                    loading="lazy"
                    decoding="async"
                    className="w-20 h-20 object-cover rounded-lg"
                  />

                  {/* Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 dark:text-white line-clamp-1">
                      {language === 'ar' ? item.product.nameAr : item.product.nameEn}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('sizes')}: {item.size}
                    </p>
                    <p className="text-[#3D5EA5] dark:text-[#7B9FD4] font-bold">
                      {item.product.price} {language === 'ar' ? 'ج.م' : 'EGP'}
                    </p>
                  </div>

                  {/* Quantity & Remove */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeFromCart(index)}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium text-gray-800 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                  {t('total')}:
                </span>
                <span className="text-2xl font-bold text-[#3D5EA5] dark:text-[#7B9FD4]">
                  {cartTotal} {language === 'ar' ? 'ج.م' : 'EGP'}
                </span>
              </div>
              <button
                onClick={onCheckout}
                className="w-full py-4 bg-linear-to-r from-[#3D5EA5] to-[#2E3A42] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#3D5EA5]/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {t('checkout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
