import { useState, useEffect } from 'react';
import { Product } from '../types';
import { API_BASE_URL, IMAGE_BASE_URL } from '../api/config';
import { useNavigate } from 'react-router-dom';

export function SearchBar({ onProductClick }: { onProductClick: (product: Product) => void }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/products/search?q=${query}`);
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error('Failed to fetch search suggestions', error);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSuggestionClick = (product: Product) => {
    onProductClick(product);
    setQuery('');
    setSuggestions([]);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for products..."
        className="w-full px-4 py-2 text-gray-900 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            navigate(`/search?q=${query}`);
            setQuery('');
            setSuggestions([]);
          }
        }}
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
          {suggestions.map((product) => (
            <li key={product._id} onClick={() => handleSuggestionClick(product)} className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer">
              <img src={product.images[0]?.startsWith('http') ? product.images[0] : `${IMAGE_BASE_URL}${product.images[0]}`} alt={product.nameEn} loading="lazy" decoding="async" className="w-12 h-12 object-cover rounded-lg mr-4" />
              <div>
                <div className="font-semibold">{product.nameEn}</div>
                <div className="text-sm text-gray-500">{product.price} EGP</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
