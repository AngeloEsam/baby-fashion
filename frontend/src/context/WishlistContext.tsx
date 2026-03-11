
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';
import { API_BASE_URL } from '../api/config';

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([]);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/wishlist`);
        const data = await response.json();
        setWishlist(data);
      } catch (error) {
        console.error('Failed to fetch wishlist', error);
      }
    };

    fetchWishlist();
  }, []);

  const addToWishlist = async (product: Product) => {
    try {
      await fetch(`${API_BASE_URL}/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: product._id }),
      });
      setWishlist([...wishlist, product]);
    } catch (error) {
      console.error('Failed to add to wishlist', error);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
        method: 'DELETE',
      });
      setWishlist(wishlist.filter(p => p._id !== productId));
    } catch (error) {
      console.error('Failed to remove from wishlist', error);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(p => p._id === productId);
  };

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, wishlistCount }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}
