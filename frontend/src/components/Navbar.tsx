import { useState } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { SearchBar } from './SearchBar';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';
import { Product } from '../types';

export function Navbar({ onCartClick, onHomeClick, onWishlistClick, onProductClick }: {
  onCartClick: () => void,
  onHomeClick: () => void,
  onWishlistClick: () => void,
  onProductClick: (product: Product) => void
}) {
  const { language, setLanguage, theme, setTheme, cartCount } = useApp();
  const { wishlistCount } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const trans = translations[language];

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.ar] || key;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={onHomeClick}>
            <img src="/assets/trois.png" alt={trans.shopName} className="h-10 w-auto" />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <SearchBar onProductClick={onProductClick} />
            <button onClick={onHomeClick} className="text-gray-700 dark:text-gray-200 hover:text-[#3D5EA5] transition-colors">
              {t('home')}
            </button>
            <a href="#products" className="text-gray-700 dark:text-gray-200 hover:text-[#3D5EA5] transition-colors">
              {t('products')}
            </a>
            <a href="#contact" className="text-gray-700 dark:text-gray-200 hover:text-[#3D5EA5] transition-colors">
              {t('contact')}
            </a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="px-3 py-1.5 text-sm font-medium text-[#3D5EA5] dark:text-[#7B9FD4] hover:bg-[#E4DFCA]/50 dark:hover:bg-[#3D5EA5]/20 rounded-lg transition-colors"
            >
              {language === 'ar' ? 'EN' : 'عربي'}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            {/* Wishlist Button */}
            <button
              onClick={onWishlistClick}
              className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.682l1.318-1.364a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={onCartClick}
              className="relative p-2 rounded-lg bg-[#E4DFCA]/50 dark:bg-[#3D5EA5]/20 text-[#3D5EA5] dark:text-[#7B9FD4] hover:bg-[#E4DFCA] dark:hover:bg-[#3D5EA5]/30 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#3D5EA5] text-white text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t dark:border-gray-700">
            <div className="flex flex-col gap-3">
              <button onClick={onHomeClick} className="px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                {t('home')}
              </button>
              <a href="#products" className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                {t('products')}
              </a>
              <a href="#contact" className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                {t('contact')}
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
