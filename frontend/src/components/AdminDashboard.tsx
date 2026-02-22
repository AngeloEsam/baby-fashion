import { useState, useEffect } from 'react';
import { translations } from '../i18n/translations';
import { Order } from '../types';

interface AdminDashboardProps {
  onClose: () => void;
}

export function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const language = 'ar'; // Default to Arabic for admin

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.ar] || key;
  };

  useEffect(() => {
    fetchOrders();
    // Poll for new orders every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.log('Using local orders');
      const localOrders = localStorage.getItem('orders');
      if (localOrders) {
        setOrders(JSON.parse(localOrders));
      }
    } finally {
      setLoading(false);
    }
  };

  const normalizePhone = (phone: string) => {
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '2' + cleaned; // Egypt: 0xxx → 20xxx
    }
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    return cleaned;
  };

  const getStatusWhatsAppMessage = (order: Order, newStatus: string) => {
    const shopName = 'Trois Kids';
    const items = order.items.map(item => `• ${item.name} (${item.size}) × ${item.quantity}`).join('%0A');

    switch (newStatus) {
      case 'confirmed':
        return `مرحباً ${order.customerName} 👋%0A%0A` +
          `✅ *تم تأكيد طلبك من ${shopName}!*%0A%0A` +
          `🛍️ المنتجات:%0A${items}%0A%0A` +
          `💰 الإجمالي: ${order.totalAmount} ج.م%0A%0A` +
          `📍 العنوان: ${order.location}%0A%0A` +
          `هنتواصل معاك قريب للتوصيل. شكراً لثقتك فينا! 🙏`;
      case 'delivered':
        return `مرحباً ${order.customerName} 👋%0A%0A` +
          `🎉 *تم توصيل طلبك من ${shopName}!*%0A%0A` +
          `نتمنى يعجبك! لو عندك أي استفسار تواصل معانا.%0A` +
          `شكراً لتسوقك معانا! ❤️`;
      case 'cancelled':
        return `مرحباً ${order.customerName} 👋%0A%0A` +
          `❌ *للأسف تم إلغاء طلبك من ${shopName}*%0A%0A` +
          `لو محتاج مساعدة أو عايز تطلب تاني، تواصل معانا في أي وقت.%0A` +
          `نعتذر عن أي إزعاج 🙏`;
      default:
        return '';
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const order = orders.find(o => o._id === orderId);

    try {
      await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchOrders();
    } catch (error) {
      // Update locally
      const updatedOrders = orders.map(o =>
        o._id === orderId ? { ...o, status: status as Order['status'] } : o
      );
      setOrders(updatedOrders);
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
    }

    // Auto-open WhatsApp with status message
    if (order) {
      const phone = normalizePhone(order.phone);
      const message = getStatusWhatsAppMessage(order, status);
      if (message) {
        window.open(`https://wa.me/${phone.replace('+', '')}?text=${message}`, '_blank');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getWhatsAppLink = (order: Order) => {
    const message = `*طلب جديد من ${order.customerName}*%0A` +
      `━━━━━━━━━━━━━━━━━━━━%0A` +
      `📞 الرقم: ${order.phone}%0A` +
      `📍 العنوان: ${order.location}%0A` +
      `━━━━━━━━━━━━━━━━━━━━%0A` +
      `🛍️ المنتجات:%0A` +
      order.items.map(item => `• ${item.name} - ${item.size} × ${item.quantity}`).join('%0A') +
      `%0A━━━━━━━━━━━━━━━━━━━━%0A` +
      `💰 الإجمالي: ${order.totalAmount} ج.م%0A` +
      `📊 الحالة: ${t(order.status)}`;

    const phone = normalizePhone(order.phone);
    return `https://wa.me/${phone.replace('+', '')}?text=${message}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dashboard */}
      <div className="absolute inset-y-0 right-0 max-w-4xl w-full bg-white dark:bg-gray-900 shadow-2xl animate-slide-in-left overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-gradient-to-r from-[#3D5EA5] to-[#2E3A42] text-white">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚙️</span>
            <div>
              <h2 className="text-xl font-bold">{t('admin')}</h2>
              <p className="text-sm opacity-80">{orders.length} {t('orders')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-[#3D5EA5] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <span className="text-6xl mb-4">📦</span>
              <p className="text-gray-500 dark:text-gray-400 text-lg">{t('noOrders')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 animate-fade-in-up"
                >
                  {/* Order Header */}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-white">
                        {order.customerName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {t(order.status)}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">📞</span>
                      <span className="text-gray-700 dark:text-gray-300">{order.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">📍</span>
                      <span className="text-gray-700 dark:text-gray-300 line-clamp-1">{order.location}</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="border-t dark:border-gray-700 pt-3 mb-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{t('orderItems')}:</p>
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white dark:bg-gray-700 rounded-lg p-2">
                          <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          <div className="text-sm">
                            <p className="font-medium text-gray-800 dark:text-white line-clamp-1">{item.name}</p>
                            <p className="text-gray-500">{item.size} × {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total & Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t dark:border-gray-700">
                    <div className="font-bold text-lg text-[#3D5EA5] dark:text-[#7B9FD4]">
                      {order.totalAmount} {language === 'ar' ? 'ج.م' : 'EGP'}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => updateOrderStatus(order._id, 'confirmed')}
                          className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          {t('markConfirmed')}
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => updateOrderStatus(order._id, 'delivered')}
                          className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                        >
                          {t('markDelivered')}
                        </button>
                      )}
                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <button
                          onClick={() => updateOrderStatus(order._id, 'cancelled')}
                          className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                        >
                          {t('markCancelled')}
                        </button>
                      )}
                      <a
                        href={getWhatsAppLink(order)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors inline-flex items-center gap-1"
                      >
                        <span>💬</span>
                        {t('whatsapp')}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
