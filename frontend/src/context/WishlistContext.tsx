
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';
import { API_BASE_URL } from '../api/config';
import { useApp } from './AppContext';

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
  const { visitorId } = useApp();

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!visitorId) return;
      try {
        const response = await fetch(`${API_BASE_URL}/wishlist`, {
          headers: {
            'x-visitor-id': visitorId
          }
        });
        const data = await response.json();
        setWishlist(data);
      } catch (error) {
        console.error('Failed to fetch wishlist', error);
      }
    };

    fetchWishlist();
  }, [visitorId]); // Added visitorId to dependency array for initial fetch

  useEffect(() => {
    if (!visitorId) return;
    fetch(`${API_BASE_URL}/analytics/track`, {
      method: 'POST',
      headers: {
        'x-visitor-id': visitorId
      }
    })
      .catch(err => console.error('Tracking error:', err));
  }, [visitorId]);

  const addToWishlist = async (product: Product) => {
    try {
      await fetch(`${API_BASE_URL}/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-visitor-id': visitorId
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
        headers: {
          'x-visitor-id': visitorId
        }
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
