import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';

const categories = ['all', 'dresses', 'suits', 'tshirts', 'jackets', 'pants'];

export interface FilterState {
  selectedCategory: string;
  selectedSizes: string[];
  minPrice: string;
  maxPrice: string;
  onSaleOnly: boolean;
}

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availableSizes: string[];
  isOpen: boolean;
  onClose: () => void;
}

export function FilterSidebar({
  filters,
  onFilterChange,
  availableSizes,
  isOpen,
  onClose,
}: FilterSidebarProps) {
  const { language } = useApp();
  const [animatingOut, setAnimatingOut] = useState(false);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.ar] || key;
  };

  const handleClose = () => {
    setAnimatingOut(true);
    setTimeout(() => {
      setAnimatingOut(false);
      onClose();
    }, 280);
  };

  const toggleSize = (size: string) => {
    const newSizes = filters.selectedSizes.includes(size)
      ? filters.selectedSizes.filter((s) => s !== size)
      : [...filters.selectedSizes, size];
    onFilterChange({ ...filters, selectedSizes: newSizes });
  };

  const setCategory = (category: string) => {
    onFilterChange({ ...filters, selectedCategory: category });
  };

  const clearFilters = () => {
    onFilterChange({
      selectedCategory: 'all',
      selectedSizes: [],
      minPrice: '',
      maxPrice: '',
      onSaleOnly: false,
    });
  };

  const hasActiveFilters =
    filters.selectedCategory !== 'all' ||
    filters.selectedSizes.length > 0 ||
    filters.minPrice !== '' ||
    filters.maxPrice !== '' ||
    filters.onSaleOnly;

  const sortedSizes = [...availableSizes].sort((a, b) => {
    const numA = parseInt(a);
    const numB = parseInt(b);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
            animatingOut ? 'opacity-0' : 'opacity-100'
          }`}
          onClick={handleClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          /* Mobile: fixed drawer */
          fixed top-0 ${language === 'ar' ? 'right-0' : 'left-0'} h-full w-80 z-50
          lg:relative lg:top-auto lg:left-auto lg:right-auto lg:h-auto lg:w-72 lg:z-auto
          bg-white dark:bg-gray-800 lg:rounded-2xl lg:shadow-lg lg:border lg:border-gray-100 dark:lg:border-gray-700
          transition-transform duration-300 ease-out
          ${isOpen
            ? animatingOut
              ? language === 'ar' ? 'translate-x-full' : '-translate-x-full'
              : 'translate-x-0'
            : language === 'ar' ? 'translate-x-full' : '-translate-x-full'
          }
          lg:translate-x-0 lg:block
          ${!isOpen ? 'hidden lg:block' : ''}
          overflow-y-auto
        `}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#3D5EA5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">{t('filterBy')}</h3>
            </div>

            {/* Mobile close button */}
            <button
              onClick={handleClose}
              className="lg:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-2 text-sm text-[#3D5EA5] hover:text-[#2E3A42] dark:hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {t('clearFilters')}
            </button>
          )}
        </div>

        <div className="p-5 space-y-6">
          {/* ─── Category Filter ─── */}
          <FilterSection title={t('category')}>
            <div className="space-y-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`w-full text-start px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    filters.selectedCategory === cat
                      ? 'bg-gradient-to-r from-[#3D5EA5] to-[#2E3A42] text-white shadow-md shadow-[#3D5EA5]/20'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {t(cat)}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* ─── Size Filter ─── */}
          <FilterSection title={t('sizeFilter')}>
            <div className="flex flex-wrap gap-2">
              {sortedSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`min-w-[48px] px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200 ${
                    filters.selectedSizes.includes(size)
                      ? 'bg-[#3D5EA5] text-white border-[#3D5EA5] shadow-md shadow-[#3D5EA5]/20'
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-[#3D5EA5] hover:text-[#3D5EA5]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* ─── Price Range Filter ─── */}
          <FilterSection title={t('priceRange')}>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    placeholder={t('minPrice')}
                    value={filters.minPrice}
                    onChange={(e) =>
                      onFilterChange({ ...filters, minPrice: e.target.value })
                    }
                    min="0"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3D5EA5]/40 focus:border-[#3D5EA5] transition-all placeholder:text-gray-400"
                  />
                </div>
                <span className="text-gray-400 font-medium">—</span>
                <div className="relative flex-1">
                  <input
                    type="number"
                    placeholder={t('maxPrice')}
                    value={filters.maxPrice}
                    onChange={(e) =>
                      onFilterChange({ ...filters, maxPrice: e.target.value })
                    }
                    min="0"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3D5EA5]/40 focus:border-[#3D5EA5] transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {language === 'ar' ? 'بالجنيه المصري' : 'In EGP'}
              </p>
            </div>
          </FilterSection>

          {/* ─── On Sale Toggle ─── */}
          <FilterSection title={t('onSaleOnly')}>
            <button
              onClick={() =>
                onFilterChange({ ...filters, onSaleOnly: !filters.onSaleOnly })
              }
              className={`relative w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300 cursor-pointer ${
                filters.onSaleOnly
                  ? 'bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-900/20 dark:to-orange-900/20 border-rose-200 dark:border-rose-700'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🔥</span>
                <span
                  className={`text-sm font-medium ${
                    filters.onSaleOnly
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {t('sale')}
                </span>
              </div>

              {/* Toggle switch */}
              <div
                className={`w-11 h-6 rounded-full transition-colors duration-300 relative ${
                  filters.onSaleOnly ? 'bg-rose-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                    filters.onSaleOnly
                      ? language === 'ar' ? 'left-0.5' : 'left-5.5'
                      : language === 'ar' ? 'left-5.5' : 'left-0.5'
                  }`}
                />
              </div>
            </button>
          </FilterSection>
        </div>
      </aside>
    </>
  );
}

/* ─── Reusable collapsible section ─── */
function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border-b border-gray-100 dark:border-gray-700 pb-5 last:border-0 last:pb-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between mb-3 group cursor-pointer"
      >
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
          {title}
        </h4>
        <svg
          className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
}
