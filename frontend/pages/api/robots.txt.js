export const config = { runtime: 'nodejs' };

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lemanas.ru';

export default async function handler(req, res) {
  const robots = `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=3600');
  res.status(200).send(robots);
}
