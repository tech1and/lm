// pages/sitemap.js
import Head from 'next/head';
import Logo from '../components/Logo';

const staticPages = [
  { path: '/', label: '🏠 Главная' },
  { path: '/rating', label: '📊 Рейтинг магазинов' },
  { path: '/blog', label: '📰 Блог' },
  { path: '/about', label: 'ℹ️ О нас' },
  { path: '/privacy', label: '🔒 Политика конфиденциальности' },
  { path: '/sitemap', label: '🗺️ Карта сайта' },
];

export async function getServerSideProps() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const [storesRes, blogRes] = await Promise.allSettled([
      fetch(`${API_URL}/api/shops/?page_size=50`, { signal: controller.signal }),
      fetch(`${API_URL}/api/blog/posts/?page_size=30`, { signal: controller.signal }),
    ]);

    clearTimeout(timeout);

    const stores = storesRes.status === 'fulfilled' && storesRes.value.ok
      ? (await storesRes.value.json().catch(() => ({}))).results || []
      : [];

    const posts = blogRes.status === 'fulfilled' && blogRes.value.ok
      ? (await blogRes.value.json().catch(() => ({}))).results || []
      : [];

    return {
      props: {
        stores,
        posts,
      },
    };
  } catch (error) {
    console.error('Sitemap page fetch error:', error);
    return { props: { stores: [], posts: [] } };
  }
}

export default function SitemapPage({ stores, posts }) {
  return (
    <>
      <Head>
        <title>Карта сайта | Рейтинг магазинов Лемана Про</title>
        <meta name="description" content="Карта сайта рейтинга магазинов Лемана Про. Все разделы и страницы." />
      </Head>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <main className="py-5">
            <h1 className="mb-4">🗺️ Карта сайта</h1>

            {/* Основные разделы */}
            <section className="mb-5">
              <h2 className="h4 mb-3">Основные разделы</h2>
              <ul className="list-unstyled">
                {staticPages.map((page) => (
                  <li key={page.path} className="mb-2">
                    <a href={page.path} className="text-decoration-none">{page.label}</a>
                  </li>
                ))}
              </ul>
            </section>

            {/* Магазины */}
            <section className="mb-5">
              <h2 className="h4 mb-3 flex items-center gap-2">
                <Logo size={20} />
                Магазины Лемана Про ({stores.length})
              </h2>
              {stores.length > 0 ? (
                <ul className="list-unstyled">
                  {stores.slice(0, 30).map((store) => (
                    <li key={store.id} className="mb-1">
                      <a href={`/shops/${store.slug}`} className="text-decoration-none">
                        {store.name}
                      </a>
                    </li>
                  ))}
                  {stores.length > 30 && (
                    <li><a href="/rating" className="text-muted">→ Все магазины</a></li>
                  )}
                </ul>
              ) : (
                <p className="text-muted">Не удалось загрузить список магазинов</p>
              )}
            </section>

            {/* Статьи блога */}
            <section>
              <h2 className="h4 mb-3">📰 Статьи ({posts.length})</h2>
              {posts.length > 0 ? (
                <ul className="list-unstyled">
                  {posts.slice(0, 20).map((post) => (
                    <li key={post.id} className="mb-2">
                      <a href={`/blog/${post.slug}`} className="text-decoration-none">
                        {post.title}
                      </a>
                    </li>
                  ))}
                  {posts.length > 20 && (
                    <li><a href="/blog" className="text-muted">→ Все статьи</a></li>
                  )}
                </ul>
              ) : (
                <p className="text-muted">Не удалось загрузить статьи</p>
              )}
            </section>

            {/* Файлы */}
            <section className="mt-5 pt-4 border-top">
              <h2 className="h4 mb-3">📄 Файлы</h2>
              <ul className="list-unstyled">
                <li><a href="/sitemap.xml">🗂️ sitemap.xml (для поисковиков)</a></li>
                <li><a href="/robots.txt">🤖 robots.txt</a></li>
              </ul>
            </section>
        </main>
      </div>
    </>
  );
}