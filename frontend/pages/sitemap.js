import Head from 'next/head';
import Logo from '../components/Logo';
import { FolderOpen } from 'lucide-react';

const staticPages = [
  { path: '/', label: '🏠 Главная' },
  { path: '/rating', label: '📊 Рейтинг магазинов' },
  { path: '/blog', label: '📰 Блог' },
  { path: '/about', label: 'ℹ️ О нас' },
  { path: '/privacy', label: '🔒 Политика конфиденциальности' },
  { path: '/sitemap', label: '🗺️ Карта сайта' },
  { path: '/catalog', label: '📦 Каталог товаров' },
];

export async function getServerSideProps() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    // Используем очень большие значения page_size для получения всех записей
    const MAX_PAGE_SIZE = 10000;

    const [storesRes, blogRes, categoriesRes, productsRes] = await Promise.allSettled([
      fetch(`${API_URL}/api/shops/?page_size=${MAX_PAGE_SIZE}`, { signal: controller.signal }),
      fetch(`${API_URL}/api/blog/posts/?page_size=${MAX_PAGE_SIZE}`, { signal: controller.signal }),
      fetch(`${API_URL}/api/catalog/categories/?page_size=${MAX_PAGE_SIZE}`, { signal: controller.signal }),
      fetch(`${API_URL}/api/catalog/products/?page_size=${MAX_PAGE_SIZE}`, { signal: controller.signal }),
    ]);

    clearTimeout(timeout);

    const stores = storesRes.status === 'fulfilled' && storesRes.value.ok
      ? (await storesRes.value.json().catch(() => ({}))).results || []
      : [];

    const posts = blogRes.status === 'fulfilled' && blogRes.value.ok
      ? (await blogRes.value.json().catch(() => ({}))).results || []
      : [];

    const categories = categoriesRes.status === 'fulfilled' && categoriesRes.value.ok
      ? (await categoriesRes.value.json().catch(() => ({}))).results || []
      : [];

    const products = productsRes.status === 'fulfilled' && productsRes.value.ok
      ? (await productsRes.value.json().catch(() => ({}))).results || []
      : [];

    return {
      props: {
        stores,
        posts,
        categories,
        products,
      },
    };
  } catch (error) {
    console.error('Sitemap page fetch error:', error);
    return { props: { stores: [], posts: [], categories: [], products: [] } };
  }
}

export default function SitemapPage({ stores, posts, categories, products }) {
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
                  {stores.map((store) => (
                    <li key={store.id} className="mb-1">
                      <a href={`/shops/${store.slug}`} className="text-decoration-none">
                        {store.name}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">Не удалось загрузить список магазинов</p>
              )}
            </section>

            {/* Статьи блога */}
            <section className="mb-5">
              <h2 className="h4 mb-3">📰 Статьи ({posts.length})</h2>
              {posts.length > 0 ? (
                <ul className="list-unstyled">
                  {posts.map((post) => (
                    <li key={post.id} className="mb-2">
                      <a href={`/blog/${post.slug}`} className="text-decoration-none">
                        {post.title}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">Не удалось загрузить статьи</p>
              )}
            </section>

            {/* Каталог товаров */}
            <section className="mb-5">
              <h2 className="h4 mb-3 flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-primary-500" />
                Каталог товаров ({categories.length} категорий, {products.length} товаров)
              </h2>
              {categories.length > 0 ? (
                <div className="mb-3">
                  <h3 className="h6 mb-2">Категории:</h3>
                  <ul className="list-unstyled">
                    {categories.map((category) => (
                      <li key={category.id} className="mb-1">
                        <a href={`/catalog/categories/${category.slug}`} className="text-decoration-none">
                          {category.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-muted">Не удалось загрузить категории</p>
              )}
              {products.length > 0 ? (
                <div>
                  <h3 className="h6 mb-2">Товары:</h3>
                  <ul className="list-unstyled">
                    {products.map((product) => (
                      <li key={product.id} className="mb-1">
                        <a href={`/p/${product.slug}`} className="text-decoration-none">
                          {product.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-muted">Не удалось загрузить товары</p>
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