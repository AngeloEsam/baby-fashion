import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';
import { Product } from '../types';
import { translations } from '../i18n/translations';
import { API_BASE_URL } from '../api/config';

const categories = ['all', 'dresses', 'suits', 'tshirts', 'jackets', 'pants'];

interface ProductsSectionProps {
  onProductClick: (product: Product) => void;
}

export function ProductsSection({ onProductClick }: ProductsSectionProps) {
  const { language } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.ar] || key;
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) {
        throw new Error(language === 'ar' ? 'فشل تحميل المنتجات' : 'Failed to load products');
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        throw new Error('Invalid data format');
      }
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    selectedCategory === 'all' || p.category === selectedCategory
  );

  if (loading) {
    return (
      <section id="products" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-[#3D5EA5] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="products" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-3xl border border-red-100 dark:border-red-800">
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <button
              onClick={fetchProducts}
              className="px-6 py-2 bg-[#3D5EA5] text-white rounded-full hover:bg-[#2E3A42] transition-colors"
            >
              {language === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
            </button>
          </div>
        </div>
      </section>
    );
  }


  return (
    <section id="products" className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-4">
            {t('allProducts')}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#3D5EA5] to-[#2E3A42] mx-auto rounded-full"></div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2 rounded-full font-medium transition-all duration-300 ${selectedCategory === category
                ? 'bg-gradient-to-r from-[#3D5EA5] to-[#2E3A42] text-white shadow-lg shadow-[#3D5EA5]/30'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-[#E4DFCA] dark:hover:bg-[#3D5EA5]/20'
                }`}
            >
              {t(category)}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <div
              key={product._id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProductCard product={product} onProductClick={onProductClick} />
            </div>
          ))}
        </div>

        {filteredProducts?.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {language === 'ar' ? 'لا توجد منتجات في هذه الفئة' : 'No products in this category'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}


