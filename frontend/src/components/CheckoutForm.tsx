import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';
import { API_BASE_URL } from '../api/config';

interface CheckoutFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CheckoutForm({ onClose, onSuccess }: CheckoutFormProps) {
  const { language, cart, cartTotal, clearCart } = useApp();
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    location: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.ar] || key;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const orderData = {
      customerName: formData.customerName,
      phone: formData.phone,
      location: formData.location,
      notes: formData.notes,
      items: cart.map(item => ({
        productId: item.product._id,
        name: language === 'ar' ? item.product.nameAr : item.product.nameEn,
        size: item.size,
        quantity: item.quantity,
        price: item.product.price,
        image: item.product.images[0]
      })),
      totalAmount: cartTotal
    };

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to place order');
      }

      // Show success message
      setLoading(false);
      setShowSuccess(true);
      clearCart();

      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (err: any) {
      console.error('Order error:', err);
      alert(language === 'ar' ? `خطأ: ${err.message}` : `Error: ${err.message}`);
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white dark:bg-gray-900 shadow-2xl">
          <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in-up">
            <div className="w-24 h-24 mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              {t('orderSuccess')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('orderSuccessMessage')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Form */}
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white dark:bg-gray-900 shadow-2xl animate-slide-in-left overflow-y-auto">
        <div className="flex flex-col min-h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              {t('orderDetails')}
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

          {/* Order Summary */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-3">
              {t('orderItems')} ({cart.reduce((sum, item) => sum + item.quantity, 0)})
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">
                    {language === 'ar' ? item.product.nameAr : item.product.nameEn} ({item.size}) x{item.quantity}
                  </span>
                  <span className="text-[#3D5EA5] dark:text-[#7B9FD4] font-medium">
                    {item.product.price * item.quantity} {language === 'ar' ? 'ج.م' : 'EGP'}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t dark:border-gray-700 flex justify-between">
              <span className="font-bold text-gray-800 dark:text-white">{t('total')}:</span>
              <span className="font-bold text-[#3D5EA5] dark:text-[#7B9FD4] text-xl">
                {cartTotal} {language === 'ar' ? 'ج.م' : 'EGP'}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('fullName')} *
              </label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-[#3D5EA5] focus:border-transparent transition-colors"
                placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('phoneNumber')} *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-[#3D5EA5] focus:border-transparent transition-colors"
                placeholder={language === 'ar' ? 'أدخل رقم تليفونك' : 'Enter your phone number'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('address')} *
              </label>
              <textarea
                required
                rows={3}
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-[#3D5EA5] focus:border-transparent transition-colors resize-none"
                placeholder={language === 'ar' ? 'أدخل العنوان بالتفصيل' : 'Enter your address in detail'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('orderNotes')}
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-[#3D5EA5] focus:border-transparent transition-colors resize-none"
                placeholder={language === 'ar' ? 'أي ملاحظات خاصة' : 'Any special notes'}
              />
            </div>

            {/* Payment Method Notice */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💵</span>
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    {language === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery'}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    {language === 'ar' ? 'ادفع نقداً عند استلام المنتجات' : 'Pay cash when receiving products'}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#3D5EA5] to-[#2E3A42] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#3D5EA5]/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {language === 'ar' ? 'جاري الإرسال...' : 'Sending...'}
                </>
              ) : (
                <>
                  <span>📦</span>
                  {t('placeOrder')}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
