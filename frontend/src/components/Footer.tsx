import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';

export function Footer() {
  const { language } = useApp();
  const trans = translations[language];

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.ar] || key;
  };

  return (
    <footer id="contact" className="bg-gradient-to-br from-[#2E3A42] via-gray-800 to-[#2E3A42] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src="/assets/trois.png" alt={trans.shopName} className="h-12 w-auto brightness-200" />
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              {t('footerDesc')}
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#3D5EA5] transition-colors">
                <span>📘</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#3D5EA5] transition-colors">
                <span>📸</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#3D5EA5] transition-colors">
                <span>💬</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('quickLinks')}</h3>
            <ul className="space-y-3">
              <li>
                <a href="#home" className="text-gray-400 hover:text-[#7B9FD4] transition-colors">
                  {t('home')}
                </a>
              </li>
              <li>
                <a href="#products" className="text-gray-400 hover:text-[#7B9FD4] transition-colors">
                  {t('products')}
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-400 hover:text-[#7B9FD4] transition-colors">
                  {t('contact')}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('contact')}</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center gap-2">
                <span>📍</span>
                <span>{language === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt'}</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span>
                <span>+20 100 000 0000</span>
              </li>
              <li className="flex items-center gap-2">
                <span>✉️</span>
                <span>info@babyvision.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-500">
            © {new Date().getFullYear()} {trans.shopName}. {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
