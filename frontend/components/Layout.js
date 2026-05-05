import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { Home, Trophy, BookOpen, Info, Menu, X, Mail, MapPin, Layers } from 'lucide-react';
import Logo from './Logo';

export default function Layout({ children, title, description, canonical, schema, keywords }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const siteTitle = title
    ? `${title} | lemanas.ru`
    : 'Рейтинг lemanas.ru';

  const siteDescription = description ||
    'Рейтинг лучших магазинов Лемана Про 2026. Читайте отзывы, сравнивайте цены и выбирайте лучший магазин.';

  const navLinks = [
    { href: '/', label: 'Главная', icon: Home },
    { href: '/catalog', label: 'Каталог', icon: Layers },
    { href: '/rating', label: 'Рейтинг', icon: Trophy },
    { href: '/blog', label: 'Блог', icon: BookOpen },
    { href: '/about', label: 'О нас', icon: Info },
  ];

  return (
    <>
      <Head>
        <title>{siteTitle}</title>
        <meta name="description" content={siteDescription} />
        {canonical && <link rel="canonical" href={canonical} />}
        {keywords && <meta name="keywords" content={keywords} />}
        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content={siteDescription} />
        {schema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        )}
      </Head>

      {/* Header */}
      <header className="bg-dark-800 sticky top-0 z-50 shadow-lg">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl">
              <Logo size={32} />
              <span>ЛеманаРейтинг</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10">
              <div className="flex flex-col gap-2">
                {navLinks.map(link => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-3"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>
      </header>

      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-dark-800 text-gray-300 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* About */}
            <div>
              <h5 className="text-primary-400 font-bold text-lg mb-3 flex items-center gap-2">
                <Logo size={20} />
                ЛеманаРейтинг
              </h5>
              <p className="text-sm text-gray-400">
                Независимый рейтинг магазинов Лемана Про. Помогаем выбрать лучший магазин
                по соотношению цена/качество.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h6 className="text-white font-semibold mb-3">Навигация</h6>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-primary-400">Главная</Link></li>
                <li><Link href="/catalog" className="hover:text-primary-400">Каталог</Link></li>
                <li><Link href="/rating" className="hover:text-primary-400">Рейтинг</Link></li>
                <li><Link href="/blog" className="hover:text-primary-400">Блог</Link></li>
                <li><Link href="/about" className="hover:text-primary-400">О нас</Link></li>
              </ul>
            </div>

            {/* Popular */}
            <div>
              <h6 className="text-white font-semibold mb-3">Популярное</h6>
              <ul className="space-y-2 text-sm">
                <li><Link href="/shops/lemana-pro-moskva" className="hover:text-primary-400">Лемана Про Москва</Link></li>
                <li><Link href="/shops/lemana-pro-spb" className="hover:text-primary-400">Лемана Про СПб</Link></li>
                <li><Link href="/shops/lemana-pro-kazan" className="hover:text-primary-400">Лемана Про Казань</Link></li>
                <li><Link href="/blog" className="hover:text-primary-400">Статьи о магазинах</Link></li>
              </ul>
            </div>

            {/* Contacts */}
            <div>
              <h6 className="text-white font-semibold mb-3">Контакты</h6>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  info@lemanas.ru
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Россия
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} ЛеманаРейтинг. Все права защищены.
            </p>
            <p className="text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-primary-400">Политика конфиденциальности</Link>
              {' · '}
              <Link href="/sitemap" className="hover:text-primary-400">Карта сайта</Link>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}