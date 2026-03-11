import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';
import { FilterSidebar, FilterState } from './FilterSidebar';
import { Product } from '../types';
import { translations } from '../i18n/translations';
import { API_BASE_URL } from '../api/config';

interface ProductsSectionProps {
  onProductClick: (product: Product) => void;
}

export function ProductsSection({ onProductClick }: ProductsSectionProps) {
  const { language } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    selectedCategory: 'all',
    selectedSizes: [],
    minPrice: '',
    maxPrice: '',
    onSaleOnly: false,
  });

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

  // Extract all unique sizes from products
  const availableSizes = useMemo(() => {
    const sizeSet = new Set<string>();
    products.forEach((p) => p.sizes?.forEach((s) => sizeSet.add(s)));
    return Array.from(sizeSet);
  }, [products]);

  // Apply all filters
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category
      if (filters.selectedCategory !== 'all' && p.category !== filters.selectedCategory) {
        return false;
      }
      // Size
      if (
        filters.selectedSizes.length > 0 &&
        !filters.selectedSizes.some((s) => p.sizes?.includes(s))
      ) {
        return false;
      }
      // Min price
      if (filters.minPrice !== '' && p.price < Number(filters.minPrice)) {
        return false;
      }
      // Max price
      if (filters.maxPrice !== '' && p.price > Number(filters.maxPrice)) {
        return false;
      }
      // On sale
      if (filters.onSaleOnly && !p.isSale) {
        return false;
      }
      return true;
    });
  }, [products, filters]);

  const hasActiveFilters =
    filters.selectedCategory !== 'all' ||
    filters.selectedSizes.length > 0 ||
    filters.minPrice !== '' ||
    filters.maxPrice !== '' ||
    filters.onSaleOnly;

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
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-4">
            {t('allProducts')}
          </h2>
          <div className="w-24 h-1 bg-linear-to-r from-[#3D5EA5] to-[#2E3A42] mx-auto rounded-full"></div>
        </div>

        {/* Mobile filter toggle + results count */}
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all text-gray-700 dark:text-gray-200 font-medium text-sm"
          >
            <svg className="w-5 h-5 text-[#3D5EA5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {t('showFilters')}
            {hasActiveFilters && (
              <span className="w-5 h-5 flex items-center justify-center text-xs bg-[#3D5EA5] text-white rounded-full">
                {(filters.selectedCategory !== 'all' ? 1 : 0) +
                  (filters.selectedSizes.length > 0 ? 1 : 0) +
                  (filters.minPrice !== '' || filters.maxPrice !== '' ? 1 : 0) +
                  (filters.onSaleOnly ? 1 : 0)}
              </span>
            )}
          </button>

          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredProducts.length} {t('resultsCount')}
          </span>
        </div>

        {/* Main layout: sidebar + products grid */}
        <div className="flex gap-8">
          {/* Filter Sidebar */}
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            availableSizes={availableSizes}
            isOpen={filtersOpen}
            onClose={() => setFiltersOpen(false)}
          />

          {/* Products area */}
          <div className="flex-1 min-w-0">
            {/* Desktop results bar */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {filteredProducts.length} {t('resultsCount')}
              </span>

              {hasActiveFilters && (
                <button
                  onClick={() =>
                    setFilters({
                      selectedCategory: 'all',
                      selectedSizes: [],
                      minPrice: '',
                      maxPrice: '',
                      onSaleOnly: false,
                    })
                  }
                  className="text-sm text-[#3D5EA5] hover:text-[#2E3A42] dark:hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {t('clearFilters')}
                </button>
              )}
            </div>

            {/* Active filter tags */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-5">
                {filters.selectedCategory !== 'all' && (
                  <FilterTag
                    label={t(filters.selectedCategory)}
                    onRemove={() => setFilters({ ...filters, selectedCategory: 'all' })}
                  />
                )}
                {filters.selectedSizes.map((size) => (
                  <FilterTag
                    key={size}
                    label={`${t('sizeFilter')}: ${size}`}
                    onRemove={() =>
                      setFilters({
                        ...filters,
                        selectedSizes: filters.selectedSizes.filter((s) => s !== size),
                      })
                    }
                  />
                ))}
                {(filters.minPrice !== '' || filters.maxPrice !== '') && (
                  <FilterTag
                    label={`${t('price')}: ${filters.minPrice || '0'} - ${filters.maxPrice || '∞'}`}
                    onRemove={() => setFilters({ ...filters, minPrice: '', maxPrice: '' })}
                  />
                )}
                {filters.onSaleOnly && (
                  <FilterTag
                    label={t('onSaleOnly')}
                    onRemove={() => setFilters({ ...filters, onSaleOnly: false })}
                  />
                )}
              </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product, index) => (
                <div
                  key={product._id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <ProductCard product={product} onProductClick={onProductClick} />
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                  {t('noResults')}
                </p>
                <button
                  onClick={() =>
                    setFilters({
                      selectedCategory: 'all',
                      selectedSizes: [],
                      minPrice: '',
                      maxPrice: '',
                      onSaleOnly: false,
                    })
                  }
                  className="mt-4 text-[#3D5EA5] hover:text-[#2E3A42] dark:hover:text-blue-300 font-medium text-sm transition-colors"
                >
                  {t('clearFilters')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Removable filter tag pill ─── */
function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#3D5EA5]/10 dark:bg-[#3D5EA5]/20 text-[#3D5EA5] dark:text-blue-300 text-sm font-medium">
      {label}
      <button
        onClick={onRemove}
        className="w-4 h-4 rounded-full hover:bg-[#3D5EA5]/20 flex items-center justify-center transition-colors"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}
