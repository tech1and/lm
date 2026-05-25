export const config = { runtime: 'nodejs' };

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lemanas.ru';

export default async function handler(req, res) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

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

    const staticPages = [
      '/',
      '/rating',
      '/blog',
      '/about',
      '/privacy',
      '/sitemap',
      '/catalog',
    ];

    const urls = [];

    // Статические страницы
    staticPages.forEach((path) => {
      urls.push({
        loc: `${BASE_URL}${path}`,
        changefreq: 'weekly',
        priority: path === '/' ? '1.0' : '0.8',
      });
    });

    // Магазины
    stores.forEach((store) => {
      if (store.slug) {
        urls.push({
          loc: `${BASE_URL}/shops/${store.slug}`,
          changefreq: 'monthly',
          priority: '0.7',
        });
      }
    });

    // Статьи блога
    posts.forEach((post) => {
      if (post.slug) {
        urls.push({
          loc: `${BASE_URL}/blog/${post.slug}`,
          changefreq: 'monthly',
          priority: '0.6',
        });
      }
    });

    // Категории
    categories.forEach((category) => {
      if (category.slug) {
        urls.push({
          loc: `${BASE_URL}/catalog/categories/${category.slug}`,
          changefreq: 'weekly',
          priority: '0.7',
        });
      }
    });

    // Товары
    products.forEach((product) => {
      if (product.slug) {
        urls.push({
          loc: `${BASE_URL}/p/${product.slug}`,
          changefreq: 'daily',
          priority: '0.5',
        });
      }
    });

    // Генерируем XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    urls.forEach((url) => {
      xml += '  <url>\n';
      xml += `    <loc>${escapeXml(url.loc)}</loc>\n`;
      xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
      xml += `    <priority>${url.priority}</priority>\n`;
      xml += '  </url>\n';
    });

    xml += '</urlset>';

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=300');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}