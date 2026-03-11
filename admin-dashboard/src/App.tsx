import { useState, useEffect, useRef } from 'react';
import { API_BASE_URL, getAuthHeader } from './config';
import type { Product, Order } from './types';
import { getImageUrl } from './utils';
import clsx from 'clsx';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('adminToken'));
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'insights'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalVisitors: 0, totalOrders: 0, totalSales: 0 });

  // Product Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    nameAr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionEn: '',
    price: '',
    originalPrice: '',
    category: 'dresses',
    sizes: '2-3, 4-5, 6-7, 8-9, 10-11, 12',
    isSale: false,
    inStock: true
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImagesToKeep, setExistingImagesToKeep] = useState<string[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, type: 'order' | 'product' } | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'delivered' | 'cancelled'>('all');

  const filteredOrders = orders.filter(o =>
    orderStatusFilter === 'all' ? true : o.status === orderStatusFilter
  );

  useEffect(() => {
    if (isLoggedIn) {
      if (activeTab === 'insights') fetchInsights();
      else fetchData();
    }
  }, [activeTab, isLoggedIn]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('adminToken', data.token);
        setIsLoggedIn(true);
        setLoginError(false);
      } else {
        setLoginError(true);
      }
    } catch (err) {
      console.error(err);
      setLoginError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('adminToken');
    window.location.reload();
  };

  const handleNotifyCustomer = (order: Order) => {
    const statusMessages: Record<string, string> = {
      pending: `مرحباً ${order.customerName}، لقد استلمنا طلبك وجاري مراجعته حالياً. إجمالي المبلغ: ${order.totalAmount} ج.م. شكراً لك!`,
      confirmed: `مرحباً ${order.customerName}، يسعدنا إبلاغك بأنه تم تأكيد طلبك وجاري التحضير للشحن. شكراً لتعاملك معنا!`,
      delivered: `مرحباً ${order.customerName}، تم توصيل طلبك بنجاح! نأمل أن تنال المنتجات إعجابك. لا تتردد في تقييمنا.`,
      cancelled: `مرحباً ${order.customerName}، نعتذر لإبلاغك بأنه تم إلغاء طلبك. للمزيد من التفاصيل يرجى التواصل معنا.`
    };

    const message = encodeURIComponent(statusMessages[order.status] || statusMessages.pending);
    const phone = order.phone.replace(/\D/g, ''); // Ensure only digits
    const whatsappUrl = `https://wa.me/${phone.startsWith('0') ? '2' + phone : phone}?text=${message}`;

    window.open(whatsappUrl, '_blank');
  };

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/business-insights`, {
        headers: getAuthHeader() as Record<string, string>
      });
      if (res.ok) {
        const data = await res.json();
        setInsights(data);
      }
    } catch (err) {
      console.error('Insights fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'orders' ? 'orders' : 'products';
      const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
        headers: getAuthHeader() as Record<string, string>
      });

      if (res.status === 401) {
        handleLogout();
        return;
      }

      const data = await res.json();
      if (activeTab === 'orders') setOrders(data);
      else setProducts(data);

      // Also fetch stats
      fetchStats();
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/stats`, {
        headers: getAuthHeader() as Record<string, string>
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  };

  // Image Handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);

      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    // Determine if we're removing an existing image or a newly uploaded one
    const existingCount = existingImagesToKeep.length;

    if (index < existingCount) {
      // Removing an existing image
      setExistingImagesToKeep(prev => prev.filter((_, i) => i !== index));
    } else {
      // Removing a newly uploaded file
      const fileIndex = index - existingCount;
      setSelectedFiles(prev => prev.filter((_, i) => i !== fileIndex));
    }

    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      descriptionAr: product.descriptionAr || '',
      descriptionEn: product.descriptionEn || '',
      price: String(product.price),
      originalPrice: String(product.originalPrice || ''),
      category: product.category,
      sizes: product.sizes.join(', '),
      isSale: product.isSale || false,
      inStock: product.inStock !== false
    });
    setPreviews(product.images.map(img => getImageUrl(img)));
    setExistingImagesToKeep(product.images);
    setSelectedFiles([]);
    setIsFormOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    Object.entries(newProduct).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    if (editingProduct) {
      formData.append('existingImages', JSON.stringify(existingImagesToKeep));
    }

    try {
      const url = editingProduct
        ? `${API_BASE_URL}/products/${editingProduct._id}`
        : `${API_BASE_URL}/products`;

      const res = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: getAuthHeader() as Record<string, string>,
        body: formData
      });

      if (res.ok) {
        setIsFormOpen(false);
        setEditingProduct(null);
        fetchData();
        resetForm();
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewProduct({
      nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '',
      price: '', originalPrice: '', category: 'dresses',
      sizes: '2-3, 4-5, 6-7, 8-9, 10-11, 12', isSale: false, inStock: true
    });
    setSelectedFiles([]);
    setExistingImagesToKeep([]);
    setPreviews([]);
  };

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(getAuthHeader() as Record<string, string>)
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchData();
      else if (res.status === 401) handleLogout();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader() as Record<string, string>
      });
      if (res.ok) fetchData();
      else if (res.status === 401) handleLogout();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader() as Record<string, string>
      });
      if (res.ok) fetchData();
      else if (res.status === 401) handleLogout();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
          <div className="text-center mb-8">
            <span className="text-5xl">🔐</span>
            <h2 className="text-2xl font-bold mt-4 dark:text-white">Admin Access</h2>
            <p className="text-gray-500 text-sm">Stand-alone Dashboard Management</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={clsx(
                "w-full px-6 py-4 rounded-2xl border outline-none transition-all dark:bg-gray-700 dark:text-white",
                loginError ? "border-red-500 animate-shake" : "border-gray-200 dark:border-gray-600 focus:border-[#3D5EA5]"
              )}
            />
            {loginError && <p className="text-red-500 text-xs text-center">Incorrect password. Try again.</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-linear-to-r from-[#3D5EA5] to-[#2E3A42] text-white font-bold rounded-2xl hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-10 pb-10 bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700 text-2xl">
              📊
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-800 dark:text-white">Admin Panel</h1>
              <button
                onClick={handleLogout}
                className="mt-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-500 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 group border border-red-100 dark:border-red-900/30"
              >
                <span className="group-hover:rotate-12 transition-transform">🚪</span>
                Logout Session
              </button>
            </div>
          </div>

          {/* Analytics Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-linear-to-br from-[#3D5EA5] to-[#2E3A42] rounded-3xl p-6 text-white shadow-xl shadow-[#3D5EA5]/20 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 text-white/10 text-9xl font-black group-hover:scale-110 transition-transform duration-700">👥</div>
              <p className="text-blue-100 font-bold uppercase tracking-widest text-[10px] mb-1">Unique Visitors</p>
              <h3 className="text-4xl font-black">{stats.totalVisitors}</h3>
              <p className="text-blue-100/60 text-xs mt-2 italic">Based on unique device IPs</p>
            </div>

            <div className="bg-linear-to-br from-[#3D5EA5] to-[#2E3A42] rounded-3xl p-6 text-white shadow-xl shadow-[#3D5EA5]/20 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 text-white/10 text-9xl font-black group-hover:scale-110 transition-transform duration-700">📦</div>
              <p className="text-blue-100 font-bold uppercase tracking-widest text-[10px] mb-1">Total Orders</p>
              <h3 className="text-4xl font-black">{stats.totalOrders}</h3>
              <p className="text-blue-100/60 text-xs mt-2 italic">Total successful transactions</p>
            </div>

            <div className="bg-linear-to-br from-[#3D5EA5] to-[#E4DFCA] rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 text-white/10 text-9xl font-black group-hover:scale-110 transition-transform duration-700">💰</div>
              <p className="text-emerald-100 font-bold uppercase tracking-widest text-[10px] mb-1">Total Revenue</p>
              <h3 className="text-4xl font-black">{stats.totalSales.toLocaleString()} <span className="text-sm font-bold">EGP</span></h3>
              <p className="text-emerald-100/60 text-xs mt-2 italic">Excluding cancelled orders</p>
            </div>
          </div>

          <div className="flex bg-white dark:bg-gray-800 rounded-2xl p-1.5 shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
            <button
              onClick={() => setActiveTab('orders')}
              className={clsx(
                "px-8 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2",
                activeTab === 'orders' ? "bg-[#3D5EA5] text-white shadow-lg" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
              )}
            >
              <span>📦</span> Orders
              {orders.filter(o => o.status === 'pending').length > 0 && (
                <span className="w-5 h-5 bg-white text-[#3D5EA5] text-[10px] rounded-full flex items-center justify-center">
                  {orders.filter(o => o.status === 'pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={clsx(
                "px-8 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2",
                activeTab === 'products' ? "bg-[#3D5EA5] text-white shadow-lg" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
              )}
            >
              <span>🏷️</span> Products
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={clsx(
                "px-8 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2",
                activeTab === 'insights' ? "bg-[#3D5EA5] text-white shadow-lg" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
              )}
            >
              <span>📈</span> Insights
            </button>
          </div>
        </div>

        {activeTab === 'orders' ? (
          /* Orders View */
          <div className="space-y-6">
            {/* ── Order Status Filters ── */}
            <div className="flex flex-wrap gap-2">
              {(['all', 'pending', 'confirmed', 'delivered', 'cancelled'] as const).map((status) => {
                const count = status === 'all' ? orders.length : orders.filter(o => o.status === status).length;
                const colorMap: Record<string, { active: string; dot: string }> = {
                  all: { active: 'from-[#3D5EA5] to-[#2E3A42]', dot: 'bg-[#3D5EA5]' },
                  pending: { active: 'from-yellow-500 to-amber-600', dot: 'bg-yellow-500' },
                  confirmed: { active: 'from-green-500 to-emerald-600', dot: 'bg-green-500' },
                  delivered: { active: 'from-blue-500 to-indigo-600', dot: 'bg-blue-500' },
                  cancelled: { active: 'from-red-500 to-rose-600', dot: 'bg-red-500' },
                };
                const c = colorMap[status];
                const isActive = orderStatusFilter === status;
                const label = status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1);
                return (
                  <button
                    key={status}
                    onClick={() => setOrderStatusFilter(status)}
                    className={clsx(
                      'px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 border',
                      isActive
                        ? `bg-gradient-to-r ${c.active} text-white shadow-lg border-transparent`
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:shadow-md'
                    )}
                  >
                    {!isActive && <span className={`w-2 h-2 rounded-full ${c.dot}`} />}
                    {label}
                    <span className={clsx(
                      'min-w-[20px] h-5 flex items-center justify-center text-[10px] font-black rounded-full px-1',
                      isActive ? 'bg-white/25 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    )}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid gap-6">
              {loading && orders.length === 0 ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-[#3D5EA5] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 p-20 rounded-4xl text-center shadow-sm">
                  <span className="text-6xl grayscale">🏜️</span>
                  <h3 className="text-xl font-bold mt-4 text-gray-400">
                    {orders.length === 0 ? 'No orders found' : 'No orders with this status'}
                  </h3>
                  {orders.length > 0 && (
                    <button
                      onClick={() => setOrderStatusFilter('all')}
                      className="mt-3 text-sm text-[#3D5EA5] hover:underline font-medium"
                    >
                      Show all orders
                    </button>
                  )}
                </div>
              ) : (
                filteredOrders.map(order => (
                  <div key={order._id} className="bg-white dark:bg-gray-800 rounded-4xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <div className="flex flex-wrap justify-between items-start gap-6 border-b dark:border-gray-700 pb-6 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[#3D5EA5]/10 dark:bg-[#3D5EA5]/20 rounded-2xl flex items-center justify-center text-2xl">👤</div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{order.customerName}</h3>
                          <p className="text-gray-500 text-sm flex items-center gap-2">
                            <span>📞 {order.phone}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span>📍 {order.location}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                          className={clsx(
                            "px-4 py-2 rounded-xl border-2 outline-none font-bold text-sm transition-all dark:bg-gray-900",
                            order.status === 'pending' && "border-yellow-200 text-yellow-600 bg-yellow-50",
                            order.status === 'confirmed' && "border-green-200 text-green-600 bg-green-50",
                            order.status === 'delivered' && "border-blue-200 text-blue-600 bg-blue-50",
                            order.status === 'cancelled' && "border-red-200 text-red-600 bg-red-50"
                          )}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => handleNotifyCustomer(order)}
                          title="Notify Customer via WhatsApp"
                          className="p-3 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-colors"
                        >
                          💬
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ id: order._id, type: 'order' })}
                          className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {order.items.map((item: { image: string; name: string; size: string; quantity: number; price: number; }, idx) => (
                        <div key={idx} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl">
                          <img src={getImageUrl(item.image)} loading="lazy" decoding="async" className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800 dark:text-gray-200">{item.name}</h4>
                            <div className="flex gap-4 mt-1">
                              <span className="text-xs px-2 py-0.5 bg-white dark:bg-gray-800 rounded-lg text-gray-500">Size: {item.size}</span>
                              <span className="text-xs px-2 py-0.5 bg-white dark:bg-gray-800 rounded-lg text-gray-500">Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <p className="text-lg font-black text-[#3D5EA5]">{item.price * item.quantity} EGP</p>
                        </div>
                      ))}
                    </div>
                    {order.notes && (
                      <div className="mt-4 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 text-sm border border-blue-100 dark:border-blue-900/30">
                        <strong className="block mb-1">💡 Notes from customer:</strong>
                        {order.notes}
                      </div>
                    )}
                    <div className="mt-6 pt-6 border-t dark:border-gray-700 flex justify-between items-center text-gray-500 text-sm">
                      <span>Ordered on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</span>
                      <div className="text-right">
                        <span className="block text-xs uppercase font-bold tracking-widest text-gray-400">Total Charged</span>
                        <span className="text-3xl font-black text-[#3D5EA5] leading-none">{order.totalAmount} EGP</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : activeTab === 'insights' ? (
          /* Insights View */
          <div className="space-y-8 animate-fade-in">
            {loading && !insights ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#3D5EA5] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : insights ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Daily Status Card */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-2xl">📅</div>
                    <div>
                      <h3 className="text-xl font-black text-gray-800 dark:text-white">Daily Performance</h3>
                      <p className="text-gray-500 text-sm">Real-time orders for today</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl text-center">
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Orders Today</p>
                      <h4 className="text-4xl font-black text-[#3D5EA5]">{insights.ordersToday}</h4>
                    </div>
                    <div className="lg:col-span-2 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl">
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">7-Day Trend</p>
                      <div className="flex items-end justify-between h-24 gap-2">
                        {insights.dailyOrders.map((d: any) => (
                          <div key={d._id} className="flex-1 flex flex-col items-center group">
                            <div 
                              className="w-full bg-[#3D5EA5] rounded-t-lg transition-all duration-500 group-hover:bg-[#2E3A42] relative"
                              style={{ height: `${(d.count / (Math.max(...insights.dailyOrders.map((x:any)=>x.count)) || 1)) * 100}%` }}
                            >
                               <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">{d.count}</span>
                            </div>
                            <span className="text-[8px] font-bold text-gray-400 mt-2 uppercase">{new Date(d._id).toLocaleDateString(undefined, {weekday: 'short'})}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Products */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-2xl">🏆</div>
                    <div>
                      <h3 className="text-xl font-black text-gray-800 dark:text-white">Best Selling Products</h3>
                      <p className="text-gray-500 text-sm">Top 5 by quantity sold</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {insights.topProducts.map((p: any) => (
                      <div key={p._id} className="relative pt-6">
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate pr-4 max-w-[70%]">{p.name}</span>
                          <span className="text-xs font-black text-[#3D5EA5]">{p.totalQuantity} Sold</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-linear-to-r from-[#3D5EA5] to-[#7B9FD4] rounded-full transition-all duration-1000"
                            style={{ width: `${(p.totalQuantity / (insights.topProducts[0]?.totalQuantity || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    {insights.topProducts.length === 0 && <p className="text-gray-400 text-center py-10 italic">No sales data yet</p>}
                  </div>
                </div>

                {/* Popular Sizes */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center text-2xl">📏</div>
                    <div>
                      <h3 className="text-xl font-black text-gray-800 dark:text-white">Most Sold Sizes</h3>
                      <p className="text-gray-500 text-sm">Size distribution across orders</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {insights.topSizes.map((s: any) => (
                      <div key={s._id} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl flex justify-between items-center group hover:bg-[#3D5EA5] transition-all cursor-default">
                        <span className="font-black text-gray-600 dark:text-gray-400 group-hover:text-white">{s._id}</span>
                        <div className="text-right">
                          <p className="text-xl font-black text-gray-900 dark:text-white group-hover:text-white leading-none">{s.totalQuantity}</p>
                          <p className="text-[10px] font-bold text-gray-400 group-hover:text-white/60">ITEMS</p>
                        </div>
                      </div>
                    ))}
                    {insights.topSizes.length === 0 && <p className="col-span-2 text-gray-400 text-center py-10 italic">No sizing data yet</p>}
                  </div>
                </div>
              </div>
            ) : (
               <div className="bg-white dark:bg-gray-800 p-20 rounded-4xl text-center shadow-sm">
                <span className="text-6xl animate-bounce inline-block">⏳</span>
                <h3 className="text-xl font-bold mt-4 text-gray-400">Loading business insights...</h3>
              </div>
            )}
          </div>
        ) : (
          /* Products View */
          <div className="space-y-8">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setEditingProduct(null);
                  resetForm();
                  setIsFormOpen(true);
                }}
                className="px-8 py-4 bg-linear-to-r from-[#3D5EA5] to-[#2E3A42] text-white font-black rounded-2xl shadow-xl shadow-[#3D5EA5]/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <span>➕</span> Add New Product
              </button>
            </div>

            {loading && !isFormOpen && products.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#3D5EA5] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(product => (
                  <div key={product._id} className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 group hover:shadow-xl hover:shadow-[#3D5EA5]/5 transition-all">
                    <div className="relative aspect-4/5 overflow-hidden">
                      <img src={getImageUrl(product.images[0])} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="w-12 h-12 bg-white text-[#3D5EA5] rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 active:scale-90 transition-all font-bold"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ id: product._id, type: 'product' })}
                          className="w-12 h-12 bg-white text-red-500 rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 active:scale-90 transition-all font-bold"
                        >
                          🗑️
                        </button>
                      </div>
                      {product.isSale && (
                        <span className="absolute top-4 left-4 px-3 py-1 bg-[#3D5EA5] text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg">SALE</span>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-[10px] text-[#3D5EA5] font-bold uppercase tracking-widest mb-1">{product.category}</p>
                          <h4 className="font-bold text-gray-800 dark:text-white leading-tight">{product.nameEn}</h4>
                          <h4 className="font-bold text-gray-400 dark:text-gray-500 text-sm leading-tight mt-1">{product.nameAr}</h4>
                        </div>
                        <div className="text-right">
                          {product.isSale && product.originalPrice && product.originalPrice > product.price && (
                            <p className="text-[10px] text-gray-400 font-bold line-through ml-auto mb-1">
                              {product.originalPrice}
                            </p>
                          )}
                          <p className="text-xl font-black text-gray-900 dark:text-white">{product.price}</p>
                          <p className="text-[10px] text-gray-400 font-bold">EGP</p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-1">
                        {product.sizes.map(s => (
                          <span key={s} className="text-[10px] px-2 py-0.5 bg-gray-50 dark:bg-gray-900 rounded-md text-gray-500">{s}</span>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t dark:border-gray-700 flex justify-between items-center">
                        <span className={clsx(
                          "text-[10px] font-bold px-2 py-1 rounded-lg",
                          product.inStock !== false ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                        )}>
                          {product.inStock !== false ? 'IN STOCK' : 'OUT OF STOCK'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* PRODUCT FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
          <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="flex flex-col max-h-[90vh]">
              <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                <h2 className="text-2xl font-black text-gray-800 dark:text-white">
                  {editingProduct ? 'Edit Product' : 'Create New Product'}
                </h2>
                <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-colors text-2xl">✕</button>
              </div>

              <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Text Fields */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Name (Arabic)</label>
                        <input type="text" required value={newProduct.nameAr} onChange={e => setNewProduct({ ...newProduct, nameAr: e.target.value })} className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none outline-none focus:ring-2 focus:ring-[#3D5EA5] transition-all dark:text-white" placeholder="فستان أنيق" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Name (English)</label>
                        <input type="text" required value={newProduct.nameEn} onChange={e => setNewProduct({ ...newProduct, nameEn: e.target.value })} className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none outline-none focus:ring-2 focus:ring-[#3D5EA5] transition-all dark:text-white" placeholder="Elegant Dress" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description (Arabic)</label>
                      <textarea rows={2} value={newProduct.descriptionAr} onChange={e => setNewProduct({ ...newProduct, descriptionAr: e.target.value })} className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none outline-none focus:ring-2 focus:ring-[#3D5EA5] transition-all dark:text-white resize-none" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description (English)</label>
                      <textarea rows={2} value={newProduct.descriptionEn} onChange={e => setNewProduct({ ...newProduct, descriptionEn: e.target.value })} className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none outline-none focus:ring-2 focus:ring-[#3D5EA5] transition-all dark:text-white resize-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Price (EGP)</label>
                        <input type="number" required value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none outline-none focus:ring-2 focus:ring-[#3D5EA5] transition-all dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Original Price</label>
                        <input
                          type="number"
                          value={newProduct.isSale ? newProduct.originalPrice : newProduct.price}
                          disabled={!newProduct.isSale}
                          onChange={e => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                          className={clsx(
                            "w-full px-5 py-3 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#3D5EA5] transition-all dark:text-white",
                            newProduct.isSale ? "bg-gray-50 dark:bg-gray-900" : "bg-gray-200 dark:bg-gray-700 opacity-50 cursor-not-allowed"
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Category</label>
                      <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none outline-none focus:ring-2 focus:ring-[#3D5EA5] transition-all dark:text-white appearance-none">
                        <option value="dresses">Dresses</option>
                        <option value="suits">Suits</option>
                        <option value="tshirts">T-Shirts</option>
                        <option value="jackets">Jackets</option>
                        <option value="pants">Pants</option>
                      </select>
                    </div>
                  </div>

                  {/* Image and Switches */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Product Images ({previews.length})</label>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {previews.map((src, i) => (
                          <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-100 dark:border-gray-700">
                            <img src={src} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(i)}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-lg flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-gray-300 hover:border-[#3D5EA5] hover:text-[#3D5EA5] transition-all"
                        >
                          <span className="text-3xl">+</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest">Upload</span>
                        </button>
                      </div>
                      <input type="file" hidden multiple ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Sizes (Comma separated)</label>
                      <input type="text" value={newProduct.sizes} onChange={e => setNewProduct({ ...newProduct, sizes: e.target.value })} className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none outline-none focus:ring-2 focus:ring-[#3D5EA5] transition-all dark:text-white" />
                    </div>

                    <div className="flex gap-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={newProduct.isSale}
                          onChange={e => {
                            const isChecked = e.target.checked;
                            setNewProduct({
                              ...newProduct,
                              isSale: isChecked,
                              originalPrice: isChecked ? newProduct.originalPrice : newProduct.price
                            });
                          }}
                          className="w-5 h-5 accent-[#3D5EA5]"
                        />
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-300 group-hover:text-[#3D5EA5] transition-colors">On Sale</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" checked={newProduct.inStock} onChange={e => setNewProduct({ ...newProduct, inStock: e.target.checked })} className="w-5 h-5 accent-[#3D5EA5]" />
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-300 group-hover:text-[#3D5EA5] transition-colors">In Stock</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button type="submit" disabled={loading} className="flex-1 py-4 bg-linear-to-r from-[#3D5EA5] to-[#2E3A42] text-white font-black rounded-2xl shadow-xl shadow-[#3D5EA5]/30 hover:shadow-2xl transition-all disabled:grayscale active:scale-[0.98]">
                    {loading ? 'Processing...' : (editingProduct ? 'Save Changes' : 'Create Product')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setDeleteConfirm(null)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl p-8 text-center animate-shake">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">⚠️</div>
            <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-2">Are you sure?</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">This action cannot be undone. All data for this {deleteConfirm.type} will be lost permanently.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirm.type === 'product') {
                    handleDeleteProduct(deleteConfirm.id);
                  } else {
                    handleDeleteOrder(deleteConfirm.id);
                  }
                  setDeleteConfirm(null);
                }}
                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/30"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
