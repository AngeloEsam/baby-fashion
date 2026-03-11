import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { WishlistProvider } from './context/WishlistContext';
import { Navbar } from './components/Navbar';
import { HeroSlider } from './components/HeroSlider';
import { ProductsSection } from './components/ProductsSection';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutForm } from './components/CheckoutForm';
import { ProductDetail } from './components/ProductDetail';
import { WishlistPage } from './components/WishlistPage';
import { Footer } from './components/Footer';
import { Product } from './types';
import { API_BASE_URL } from './api/config';
import { SearchPage } from './components/SearchPage';

function Home({ onProductClick }: { onProductClick: (product: Product) => void }) {
  return (
    <>
      <main>
        <HeroSlider />
        <ProductsSection onProductClick={onProductClick} />
      </main>
      <Footer />
    </>
  );
}

function AppContent() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE_URL}/analytics/track`, { method: 'POST' })
      .catch(err => console.error('Tracking error:', err));
  }, []);

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSuccess = () => {
    setIsCheckoutOpen(false);
  };

  const handleProductClick = (product: Product) => {
    navigate(`/product/${product._id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <Navbar
        onCartClick={() => setIsCartOpen(true)}
        onWishlistClick={() => navigate('/wishlist')}
        onHomeClick={() => navigate('/')}
        onProductClick={handleProductClick}
      />

      <Routes>
        <Route path="/" element={<Home onProductClick={handleProductClick} />} />
        <Route path="/search" element={<SearchPage onProductClick={handleProductClick} />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/wishlist" element={<WishlistPage onProductClick={handleProductClick} onBack={() => navigate(-1)} />} />
      </Routes>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />

      {isCheckoutOpen && (
        <CheckoutForm
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </div>
  );
}

export function App() {
  return (
    <Router>
      <AppProvider>
        <WishlistProvider>
          <AppContent />
        </WishlistProvider>
      </AppProvider>
    </Router>
  );
}
