import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=1600&auto=format&fit=crop&q=80',
    title: { ar: 'أحدث تشكيلات ملابس الأطفال', en: 'Latest Kids Fashion Collection' },
    subtitle: { ar: 'خصومات تصل لـ 50%', en: 'Up to 50% Off' },
    cta: { ar: 'تسوق الآن', en: 'Shop Now' },
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1604467794349-0b74285de7e7?w=1600&auto=format&fit=crop&q=80',
    title: { ar: 'فساتين أطفال أنيقة', en: 'Elegant Kids Dresses' },
    subtitle: { ar: 'جودة عالية وأسعار مميزة', en: 'High Quality & Great Prices' },
    cta: { ar: 'شاهد المزيد', en: 'View More' },
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1621452773781-0f992fd1f5cb?w=1600&auto=format&fit=crop&q=80',
    title: { ar: 'ملابس مريحة للأطفال', en: 'Comfortable Kids Wear' },
    subtitle: { ar: 'أفضل الخامات لأطفالك', en: 'Best Materials for Your Kids' },
    cta: { ar: 'تسوق الآن', en: 'Shop Now' },
  },
];

export function HeroSlider() {
  const { language } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative h-screen overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
        >
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            <img
              src={slide.image}
              alt={slide.title[language]}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-xl animate-fade-in-up">
                <span className="inline-block px-4 py-1 bg-pink-500 text-white text-sm font-medium rounded-full mb-4">
                  {slide.subtitle[language]}
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  {slide.title[language]}
                </h1>
                <button
                  onClick={scrollToProducts}
                  className="px-8 py-4 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-300 transform hover:scale-105"
                >
                  {slide.cta[language]}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
              ? 'bg-pink-500 w-8'
              : 'bg-white/50 hover:bg-white/80'
              }`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => setCurrentSlide((currentSlide - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-white transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => setCurrentSlide((currentSlide + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-white transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Scroll Indicator */}
      <div className="absolute bottom-4 right-4 animate-bounce">
        <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
