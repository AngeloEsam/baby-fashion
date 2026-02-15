import { useState, useEffect, useRef } from 'react';
import { API_BASE_URL, getAuthHeader } from './config';
import type { Product, Order } from './types';
import { getImageUrl } from './utils';
import clsx from 'clsx';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('adminToken'));
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
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

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
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

  const handleNotifyCustomer = (order: any) => {
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
                loginError ? "border-red-500 animate-shake" : "border-gray-200 dark:border-gray-600 focus:border-pink-500"
              )}
            />
            {loginError && <p className="text-red-500 text-xs text-center">Incorrect password. Try again.</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold rounded-2xl hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
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
            <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl p-6 text-white shadow-xl shadow-pink-500/20 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 text-white/10 text-9xl font-black group-hover:scale-110 transition-transform duration-700">👥</div>
              <p className="text-pink-100 font-bold uppercase tracking-widest text-[10px] mb-1">Unique Visitors</p>
              <h3 className="text-4xl font-black">{stats.totalVisitors}</h3>
              <p className="text-pink-100/60 text-xs mt-2 italic">Based on unique device IPs</p>
            </div>

            <div className="bg-gradient-to-br from-violet-500 to-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-violet-500/20 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 text-white/10 text-9xl font-black group-hover:scale-110 transition-transform duration-700">📦</div>
              <p className="text-violet-100 font-bold uppercase tracking-widest text-[10px] mb-1">Total Orders</p>
              <h3 className="text-4xl font-black">{stats.totalOrders}</h3>
              <p className="text-violet-100/60 text-xs mt-2 italic">Total successful transactions</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
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
                activeTab === 'orders' ? "bg-pink-500 text-white shadow-lg" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
              )}
            >
              <span>📦</span> Orders
              {orders.filter(o => o.status === 'pending').length > 0 && (
                <span className="w-5 h-5 bg-white text-pink-500 text-[10px] rounded-full flex items-center justify-center">
                  {orders.filter(o => o.status === 'pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={clsx(
                "px-8 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2",
                activeTab === 'products' ? "bg-pink-500 text-white shadow-lg" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
              )}
            >
              <span>🏷️</span> Products
            </button>
          </div>
        </div>

        {activeTab === 'orders' ? (
          /* Orders View */
          <div className="grid gap-6">
            {loading && orders.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 p-20 rounded-[2.5rem] text-center shadow-sm">
                <span className="text-6xl grayscale">🏜️</span>
                <h3 className="text-xl font-bold mt-4 text-gray-400">No orders found</h3>
              </div>
            ) : (
              orders.map(order => (
                <div key={order._id} className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap justify-between items-start gap-6 border-b dark:border-gray-700 pb-6 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-pink-50 dark:bg-pink-900/20 rounded-2xl flex items-center justify-center text-2xl">👤</div>
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
                    {order.items.map((item: any, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl">
                        <img src={getImageUrl(item.image)} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 dark:text-gray-200">{item.name}</h4>
                          <div className="flex gap-4 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-white dark:bg-gray-800 rounded-lg text-gray-500">Size: {item.size}</span>
                            <span className="text-xs px-2 py-0.5 bg-white dark:bg-gray-800 rounded-lg text-gray-500">Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <p className="text-lg font-black text-pink-600">{item.price * item.quantity} EGP</p>
                      </div>
                    ))}
                  </div>
                  {order.notes && (
                    <div className="mt-4 p-4 rounded-2xl bg-violet-50 dark:bg-violet-900/10 text-violet-700 dark:text-violet-400 text-sm border border-violet-100 dark:border-violet-900/30">
                      <strong className="block mb-1">💡 Notes from customer:</strong>
                      {order.notes}
                    </div>
                  )}
                  <div className="mt-6 pt-6 border-t dark:border-gray-700 flex justify-between items-center text-gray-500 text-sm">
                    <span>Ordered on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</span>
                    <div className="text-right">
                      <span className="block text-xs uppercase font-bold tracking-widest text-gray-400">Total Charged</span>
                      <span className="text-3xl font-black text-pink-600 leading-none">{order.totalAmount} EGP</span>
                    </div>
                  </div>
                </div>
              ))
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
                className="px-8 py-4 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-black rounded-2xl shadow-xl shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <span>➕</span> Add New Product
              </button>
            </div>

            {loading && !isFormOpen && products.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(product => (
                  <div key={product._id} className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 group hover:shadow-xl hover:shadow-pink-500/5 transition-all">
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <img src={getImageUrl(product.images[0])} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="w-12 h-12 bg-white text-pink-500 rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 active:scale-90 transition-all font-bold"
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
                        <span className="absolute top-4 left-4 px-3 py-1 bg-pink-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg">SALE</span>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-[10px] text-pink-500 font-bold uppercase tracking-widest mb-1">{product.category}</p>
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
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
                        <input type="text" required value={newProduct.nameAr} onChange={e => setNewProduct({ ...newProduct, nameAr: e.target.value })} className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none outline-none focus:ring-2 focus:ring-pink-500 transition-all dark:text-white" placeholder="فستان أنيق" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Name (English)</label>
                        <input type="text" required value={newProduct.nameEn} onChange={e => setNewProduct({ ...newProduct, nameEn: e.target.value })} className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none outline-none focus:ring-2 focus:ring-pink-500 transition-all dark:text-white" placeholder="Elegant Dress" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description (Arabic)</label>
                      <textarea rows={2} value={newProduct.descriptionAr} onChange={e => setNewProduct({ ...newProduct, descriptionAr: e.target.value })} className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none outline-none focus:ring-2 focus:ring-pink-500 transition-all dark:text-white resize-none" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description (English)</label>
                      <textarea rows={2} value={newProduct.descriptionEn} onChange={e => setNewProduct({ ...newProduct, descriptionEn: e.target.value })} className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none outline-none focus:ring-2 focus:ring-pink-500 transition-all dark:text-white resize-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Price (EGP)</label>
                        <input type="number" required value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none outline-none focus:ring-2 focus:ring-pink-500 transition-all dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Original Price</label>
                        <input
                          type="number"
                          value={newProduct.isSale ? newProduct.originalPrice : newProduct.price}
                          disabled={!newProduct.isSale}
                          onChange={e => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                          className={clsx(
                            "w-full px-5 py-3 rounded-2xl border-none outline-none focus:ring-2 focus:ring-pink-500 transition-all dark:text-white",
                            newProduct.isSale ? "bg-gray-50 dark:bg-gray-900" : "bg-gray-200 dark:bg-gray-700 opacity-50 cursor-not-allowed"
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Category</label>
                      <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none outline-none focus:ring-2 focus:ring-pink-500 transition-all dark:text-white appearance-none">
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
                          className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-gray-300 hover:border-pink-500 hover:text-pink-500 transition-all"
                        >
                          <span className="text-3xl">+</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest">Upload</span>
                        </button>
                      </div>
                      <input type="file" hidden multiple ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Sizes (Comma separated)</label>
                      <input type="text" value={newProduct.sizes} onChange={e => setNewProduct({ ...newProduct, sizes: e.target.value })} className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none outline-none focus:ring-2 focus:ring-pink-500 transition-all dark:text-white" />
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
                          className="w-5 h-5 accent-pink-500"
                        />
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-300 group-hover:text-pink-500 transition-colors">On Sale</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" checked={newProduct.inStock} onChange={e => setNewProduct({ ...newProduct, inStock: e.target.checked })} className="w-5 h-5 accent-pink-500" />
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-300 group-hover:text-pink-500 transition-colors">In Stock</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button type="submit" disabled={loading} className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-black rounded-2xl shadow-xl shadow-pink-500/30 hover:shadow-2xl transition-all disabled:grayscale active:scale-[0.98]">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
