import { shopsAPI, blogAPI } from '../lib/api';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lemanas.ru';

const staticPages = [
  { path: '/', priority: 1.0, changefreq: 'daily' },
  { path: '/rating', priority: 0.9, changefreq: 'daily' },
  { path: '/blog', priority: 0.8, changefreq: 'weekly' },
  { path: '/about', priority: 0.5, changefreq: 'monthly' },
  { path: '/privacy', priority: 0.3, changefreq: 'yearly' },
  { path: '/sitemap', priority: 0.3, changefreq: 'monthly' },
];

const formatDate = (date) => {
  if (!date) return new Date().toISOString();
  return new Date(date).toISOString();
};

export async function getServerSideProps({ res }) {
  try {
    const [shopsRes, blogRes] = await Promise.allSettled([
      shopsAPI.getList({ page_size: 200 }),
      blogAPI.getPosts({ page_size: 100 }),
    ]);

    const shopsData = shopsRes.status === 'fulfilled' ? shopsRes.value.data : {};
    const blogData = blogRes.status === 'fulfilled' ? blogRes.value.data : {};

    const shops = shopsData.results || shopsData || [];
    const posts = blogData.results || blogData || [];

    const urls = [
      ...staticPages.map((page) => ({
        loc: `${BASE_URL}${page.path}`,
        lastmod: new Date().toISOString(),
        changefreq: page.changefreq,
        priority: page.priority,
      })),
      ...shops.map((shop) => ({
        loc: `${BASE_URL}/shops/${shop.slug}`,
        lastmod: formatDate(shop.updated_at || shop.created_at),
        changefreq: 'weekly',
        priority: 0.7,
      })),
      ...posts.map((post) => ({
        loc: `${BASE_URL}/blog/${post.slug}`,
        lastmod: formatDate(post.updated_at || post.created_at),
        changefreq: 'monthly',
        priority: 0.6,
      })),
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

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
