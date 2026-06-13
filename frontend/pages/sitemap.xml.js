// pages/sitemap.xml.js

// 1. Пустой компонент, чтобы Next.js не выдавал ошибку сборки
const Sitemap = () => null;

// 2. Функция, которая сгенерирует XML и отдаст его поисковикам
export const getServerSideProps = async ({ res }) => {
  // ⚠️ ЗАМЕНИТЕ на базовый URL вашего сайта (без слэша в конце)
  const baseUrl = 'https://ваш-домен.ru'; 

  // Статические страницы (добавьте сюда пути к вашим разделам/секциям)
  const staticPages = [
    { path: '/', changefreq: 'daily', priority: 1.0 },
    { path: '/about', changefreq: 'monthly', priority: 0.8 },
    { path: '/contacts', changefreq: 'monthly', priority: 0.8 },
    // Добавьте сюда остальные ваши разделы, например:
    // { path: '/sections/design', changefreq: 'weekly', priority: 0.7 },
    // { path: '/sections/development', changefreq: 'weekly', priority: 0.7 },
  ];

  // Если у вас есть динамические разделы (например, статьи или категории),
  // вы можете подтянуть их из базы данных или API прямо здесь:
  // const dynamicSections = await fetchSectionsFromDB();
  const dynamicSections = [
    // Пример динамических путей:
    // { path: '/sections/section-1' },
    // { path: '/sections/section-2' },
  ];

  // Объединяем все пути
  const allPages = [
    ...staticPages,
    ...dynamicSections.map((s) => ({ ...s, changefreq: 'weekly', priority: 0.6 })),
  ];

  // Формируем XML-структуру
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allPages
    .map((page) => {
      return `
  <url>
    <loc>${baseUrl}${page.path}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    })
    .join('')}
</urlset>`;

  // Настраиваем заголовки и отдаем XML
  res.setHeader('Content-Type', 'text/xml');
  res.write(xml);
  res.end();

  return { props: {} };
};

// 3. Обязательно экспортируем компонент по умолчанию
export default Sitemap;