import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Product } from '../types';
import { API_BASE_URL } from '../api/config';
import { ProductCard } from './ProductCard';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export function SearchPage({ onProductClick }: { onProductClick: (product: Product) => void }) {
  const query = useQuery().get('q');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/products/search?q=${query}`);
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Failed to fetch search results', error);
      }
      setLoading(false);
    };

    fetchResults();
  }, [query]);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24">
      <h1 className="text-3xl font-bold mb-6">Search Results for "{query}"</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {results.map((product) => (
          <ProductCard key={product._id} product={product} onProductClick={onProductClick} />
        ))}
      </div>
    </div>
  );
}
