import { shopsAPI, blogAPI, catalogAPI } from '../lib/api';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lemanas.ru';
const PAGE_SIZE = 10000;

const staticPages = [
  { path: '/', priority: 1.0, changefreq: 'daily' },
  { path: '/rating', priority: 0.9, changefreq: 'daily' },
  { path: '/blog', priority: 0.8, changefreq: 'weekly' },
  { path: '/about', priority: 0.5, changefreq: 'monthly' },
  { path: '/privacy', priority: 0.3, changefreq: 'yearly' },
  { path: '/sitemap', priority: 0.3, changefreq: 'monthly' },
  { path: '/catalog', priority: 0.8, changefreq: 'weekly' },
];

const formatDate = (date) => {
  if (!date) return new Date().toISOString();
  return new Date(date).toISOString();
};

// Функция для экранирования специальных XML-символов
function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Функция для получения всех записей с пагинацией
async function getAllItems(apiFunc, initialParams = {}) {
  const allItems = [];
  let page = 1;
  let hasMore = true;

  // Размер страницы API - Django REST Framework настроен на MAX_PAGE_SIZE = 1000
  const API_PAGE_SIZE = 1000;

  while (hasMore) {
    try {
      const response = await apiFunc({ ...initialParams, page, page_size: API_PAGE_SIZE });
      const data = response.data;
      const items = Array.isArray(data) ? data : (data.results || data.items || []);

      if (items.length === 0) {
        hasMore = false;
        break;
      }

      allItems.push(...items);

      // Проверяем, есть ли еще страницы
      // Если получили меньше записей чем размер страницы, значит это последняя страница
      if (items.length < API_PAGE_SIZE) {
        hasMore = false;
      } else {
        page++;
      }
    } catch (error) {
      console.error(`Error fetching page ${page} in getAllItems:`, error.message);
      hasMore = false;
      break;
    }
  }

  return allItems;
}

// Генерация XML для sitemap index (основная карта)
function generateSitemapIndex(sitemapUrls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map((url) => `  <sitemap>
    <loc>${escapeXml(url.loc)}</loc>
    ${url.lastmod ? `<lastmod>${escapeXml(url.lastmod)}</lastmod>` : ''}
  </sitemap>`).join('\n')}
</sitemapindex>`;
}

// Генерация XML для urlset (дочерняя карта)
function generateUrlSet(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${escapeXml(url.lastmod)}</lastmod>
    <changefreq>${escapeXml(url.changefreq)}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
}

export async function getServerSideProps({ res, query }) {
  try {
    const page = query.p ? parseInt(query.p, 10) : null;
    const type = query.type || 'all';

    // Если указан параметр page (p), генерируем дочернюю карту
    if (page !== null) {
      const MAX_PAGE_SIZE = 10000;
      let urls = [];

      if (type === 'products') {
        const products = await getAllItems(catalogAPI.getProducts.bind(catalogAPI));
        const startIndex = (page - 1) * MAX_PAGE_SIZE;
        const endIndex = startIndex + MAX_PAGE_SIZE;
        const pageProducts = products.slice(startIndex, endIndex);

        urls = pageProducts.map((product) => ({
          loc: `${BASE_URL}/p/${product.slug}`,
          lastmod: formatDate(product.updated_at || product.created_at),
          changefreq: 'monthly',
          priority: 0.6,
        }));
      } else if (type === 'blog') {
        const posts = await getAllItems(blogAPI.getPosts.bind(blogAPI));
        const startIndex = (page - 1) * MAX_PAGE_SIZE;
        const endIndex = startIndex + MAX_PAGE_SIZE;
        const pagePosts = posts.slice(startIndex, endIndex);

        urls = pagePosts.map((post) => ({
          loc: `${BASE_URL}/blog/${post.slug}`,
          lastmod: formatDate(post.updated_at || post.created_at),
          changefreq: 'monthly',
          priority: 0.6,
        }));
      } else if (type === 'shops') {
        const shops = await getAllItems(shopsAPI.getList.bind(shopsAPI));
        const startIndex = (page - 1) * MAX_PAGE_SIZE;
        const endIndex = startIndex + MAX_PAGE_SIZE;
        const pageShops = shops.slice(startIndex, endIndex);

        urls = pageShops.map((shop) => ({
          loc: `${BASE_URL}/shops/${shop.slug}`,
          lastmod: formatDate(shop.updated_at || shop.created_at),
          changefreq: 'weekly',
          priority: 0.7,
        }));
      } else if (type === 'categories') {
        const categories = await getAllItems(catalogAPI.getCategories.bind(catalogAPI));
        const startIndex = (page - 1) * MAX_PAGE_SIZE;
        const endIndex = startIndex + MAX_PAGE_SIZE;
        const pageCategories = categories.slice(startIndex, endIndex);

        urls = pageCategories.map((category) => ({
          loc: `${BASE_URL}/catalog/categories/${category.slug}`,
          lastmod: formatDate(category.updated_at || category.created_at),
          changefreq: 'weekly',
          priority: 0.7,
        }));
      }

      if (urls.length === 0 && page > 1) {
        return { notFound: true };
      }

      const sitemap = generateUrlSet(urls);

      res.setHeader('Content-Type', 'application/xml');
      res.write(sitemap);
      res.end();

      return { props: {} };
    }

    // Обработка запроса на статические страницы
    if (type === 'static') {
      const urls = staticPages.map((pageItem) => ({
        loc: `${BASE_URL}${pageItem.path}`,
        lastmod: new Date().toISOString(),
        changefreq: pageItem.changefreq,
        priority: pageItem.priority,
      }));

      const sitemap = generateUrlSet(urls);

      res.setHeader('Content-Type', 'application/xml');
      res.write(sitemap);
      res.end();

      return { props: {} };
    }

    // Генерация основной карты сайта (sitemap index)
    const [shops, posts, categories, products] = await Promise.all([
      getAllItems(shopsAPI.getList.bind(shopsAPI)),
      getAllItems(blogAPI.getPosts.bind(blogAPI)),
      getAllItems(catalogAPI.getCategories.bind(catalogAPI)),
      getAllItems(catalogAPI.getProducts.bind(catalogAPI)),
    ]);

    const sitemapUrls = [];
    const now = new Date().toISOString();

    // Статические страницы
    sitemapUrls.push({
      loc: `${BASE_URL}/sitemap.xml?type=static`,
      lastmod: now,
    });

    // Категории
    const categoriesPages = Math.ceil(categories.length / PAGE_SIZE) || 1;
    for (let i = 1; i <= categoriesPages; i++) {
      sitemapUrls.push({
        loc: `${BASE_URL}/sitemap.xml?type=categories&p=${i}`,
        lastmod: now,
      });
    }

    // Товары
    const productsPages = Math.ceil(products.length / PAGE_SIZE) || 1;
    for (let i = 1; i <= productsPages; i++) {
      sitemapUrls.push({
        loc: `${BASE_URL}/sitemap.xml?type=products&p=${i}`,
        lastmod: now,
      });
    }

    // Магазины
    const shopsPages = Math.ceil(shops.length / PAGE_SIZE) || 1;
    for (let i = 1; i <= shopsPages; i++) {
      sitemapUrls.push({
        loc: `${BASE_URL}/sitemap.xml?type=shops&p=${i}`,
        lastmod: now,
      });
    }

    // Посты блога
    const postsPages = Math.ceil(posts.length / PAGE_SIZE) || 1;
    for (let i = 1; i <= postsPages; i++) {
      sitemapUrls.push({
        loc: `${BASE_URL}/sitemap.xml?type=blog&p=${i}`,
        lastmod: now,
      });
    }

    const sitemap = generateSitemapIndex(sitemapUrls);

    res.setHeader('Content-Type', 'application/xml');
    res.write(sitemap);
    res.end();

    return { props: {} };
  } catch (error) {
    console.error('Sitemap XML error:', error);
    return { notFound: true };
  }
}

export default function Sitemap() {
  return null;
}