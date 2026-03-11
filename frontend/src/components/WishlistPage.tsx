
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from './ProductCard';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';

interface WishlistPageProps {
  onProductClick: (product: any) => void;
  onBack: () => void;
}

export function WishlistPage({ onProductClick, onBack }: WishlistPageProps) {
  const { wishlist } = useWishlist();
  const { language } = useApp();
  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.ar] || key;
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="flex items-center mb-8">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('wishlist')}</h1>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500 dark:text-gray-400">{t('wishlistEmpty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map(product => (
            <ProductCard key={product._id} product={product} onProductClick={onProductClick} />
          ))}
        </div>
      )}
    </div>
  );
}
