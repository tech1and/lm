import Layout from '../components/Layout';
import RatingList from '../components/RatingList';
import Link from 'next/link';
import { shopsAPI, blogAPI } from '../lib/api';
import { Trophy, BookOpen, Star, RefreshCw, Search, ShieldCheck, MessageSquare, Eye } from 'lucide-react';

export default function HomePage({ topshops, latestPosts, stats }) {
  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Рейтинг магазинов Лемана Про",
    "url": process.env.NEXT_PUBLIC_SITE_URL,
    "description": "Независимый рейтинг лучших магазинов Лемана Про 2026",
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${process.env.NEXT_PUBLIC_SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Layout
      title="Рейтинг магазинов Лемана Про 2026 — Топ-20 лучших"
      description="Независимый рейтинг 20 лучших магазинов Лемана Про. Сравнивайте цены, читайте отзывы, выбирайте лучший магазин."
      canonical={process.env.NEXT_PUBLIC_SITE_URL}
      schema={homeSchema}
    >
      {/* Hero */}
      <section className="bg-gradient-to-br from-dark-800 via-dark-900 to-blue-900 text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-primary-500 text-dark-800 px-4 py-1.5 rounded-full font-bold text-sm mb-4">
                🏆 Рейтинг 2026
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 leading-tight">
                Лучшие магазины<br />Лемана Про
              </h1>
              <p className="text-lg text-gray-300 mb-8">
                Независимый рейтинг 20 ведущих магазинов Лемана Про.
                Реальные отзывы, актуальные цены и честные оценки.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="#rating" className="bg-primary-500 hover:bg-primary-600 text-dark-800 px-8 py-3 rounded-xl font-bold text-lg transition-colors">
                  Смотреть рейтинг
                </Link>
                <Link href="/blog" className="border-2 border-white/30 hover:border-white/60 text-white px-8 py-3 rounded-xl font-bold text-lg transition-colors">
                  Статьи
                </Link>
              </div>
            </div>
            <div className="text-center hidden lg:block">
              <div className="text-9xl leading-none mb-4">🏪</div>
              <p className="text-gray-400">Рейтинг обновляется ежедневно</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white shadow-md py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="stat-item border-r border-gray-200">
              <div className="stat-value text-3xl">{stats?.total || 20}+</div>
              <div className="stat-label">Магазинов</div>
            </div>
            <div className="stat-item border-r border-gray-200">
              <div className="stat-value text-3xl">{stats?.reviews || '500'}+</div>
              <div className="stat-label">Отзывов</div>
            </div>
            <div className="stat-item">
              <div className="stat-value text-3xl">{stats?.views || '10K'}+</div>
              <div className="stat-label">Посетителей</div>
            </div>
          </div>
        </div>
      </section>

      {/* Rating Section */}
      <section id="rating" className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                <Trophy className="w-8 h-8 text-primary-500" />
                Рейтинг магазинов Лемана Про
              </h2>
              <p className="text-gray-500 mt-1">
                Топ-20 лучших магазинов по мнению пользователей
              </p>
            </div>
            <Link href="/rating" className="border-2 border-primary-400 text-primary-600 hover:bg-primary-50 px-6 py-2 rounded-xl font-semibold transition-colors">
              Все магазины
            </Link>
          </div>

          <RatingList />
        </div>
      </section>

      {/* Blog Preview */}
      {latestPosts && latestPosts.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                  Полезные статьи
                </h2>
                <p className="text-gray-500 mt-1">Советы и рейтинги для выбора магазина</p>
              </div>
              <Link href="/blog" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-xl font-semibold transition-colors">
                Все статьи
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestPosts.slice(0, 3).map(post => (
                <div key={post.id} className="lm-card overflow-hidden blog-card">
                  {post.image ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${post.image}`}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-5xl">
                      🏪
                    </div>
                  )}
                  <div className="p-5">
                    {post.category && (
                      <span className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold mb-2">
                        {post.category.name}
                      </span>
                    )}
                    <h3 className="text-base font-bold mb-2">
                      <Link href={`/blog/${post.slug}`} className="text-gray-900 hover:text-blue-600">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-gray-500 text-sm mb-3">
                      {post.excerpt?.slice(0, 100)}...
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>
                        {new Date(post.created_at).toLocaleDateString('ru-RU')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {post.views_count}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SEO текст */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">О рейтинге магазинов Лемана Про</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Наш сайт представляет независимый рейтинг магазинов Лемана Про,
              основанный на реальных отзывах покупателей и объективных данных.
              Мы анализируем качество обслуживания, ассортимент товаров,
              ценовую политику и удобство расположения каждого магазина.
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              В нашем рейтинге представлены магазины Лемана Про в разных районах,
              предлагающие широкий выбор товаров для дома и ремонта.
              Рейтинг формируется на основе лайков, отзывов и просмотров
              страниц магазинов.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
              {[
                { icon: Star, title: 'Объективный рейтинг', text: 'Основан на реальных данных покупателей' },
                { icon: RefreshCw, title: 'Ежедневное обновление', text: 'Рейтинг обновляется каждый день' },
                { icon: Search, title: 'Детальный анализ', text: 'Подробные страницы каждого магазина' },
                { icon: MessageSquare, title: 'Реальные отзывы', text: 'Комментарии проходят модерацию' },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100">
                    <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <strong className="text-gray-900">{item.title}</strong>
                      <p className="text-sm text-gray-500 mt-1">{item.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export async function getServerSideProps() {
  try {
    const [taxiRes, blogRes] = await Promise.all([
      shopsAPI.getList({ ordering: '-rating', page_size: 20 }),
      blogAPI.getPosts({ page_size: 3 }),
    ]);
    const taxiData = taxiRes.data;
    const blogData = blogRes.data;

    const topshops = taxiData.results || taxiData;
    const latestPosts = blogData.results || blogData;

    const totalViews = topshops.reduce((sum, p) => sum + (p.views_count || 0), 0);

    return {
      props: {
        topshops: topshops.slice(0, 20),
        latestPosts: latestPosts.slice(0, 3),
        stats: {
          total: topshops.length,
          reviews: 500,
          views: totalViews > 1000 ? `${Math.floor(totalViews / 1000)}K` : totalViews,
        },
      },
    };
  } catch (err) {
    console.error('SSR Error:', err.message);
    return {
      props: {
        topshops: [],
        latestPosts: [],
        stats: { total: 20, reviews: 500, views: '10K' },
      },
    };
  }
}
