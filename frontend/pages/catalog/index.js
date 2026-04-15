import Layout from '../../components/Layout';
import CatalogProductList from '../../components/CatalogProductList';
import Link from 'next/link';
import { FolderOpen, ChevronRight, Home } from 'lucide-react';
import { catalogAPI } from '../../lib/api';

export default function CatalogPage({ categories, initialData }) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Главная", "item": process.env.NEXT_PUBLIC_SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Каталог", "item": `${process.env.NEXT_PUBLIC_SITE_URL}/catalog` },
    ],
  };

  return (
    <Layout
      title="Каталог товаров — Все категории и товары"
      description="Каталог всех товаров Лемана Про. Сравнивайте цены, читайте отзывы, выбирайте лучший товар."
      canonical={`${process.env.NEXT_PUBLIC_SITE_URL}/catalog`}
      schema={breadcrumbSchema}
    >
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500" aria-label="breadcrumb">
            <Link href="/" className="hover:text-gray-700 flex items-center gap-1">
              <Home className="w-4 h-4" />
              Главная
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">Каталог</span>
          </nav>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <span className="inline-block bg-primary-500 text-dark-800 px-4 py-1.5 rounded-full font-bold text-sm mb-4">
            📦 Каталог товаров
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mb-3 flex items-center gap-3">
            <FolderOpen className="w-8 h-8 text-primary-500" />
            Каталог товаров Лемана Про
          </h1>
          <p className="text-gray-500 text-lg">
            Сравнение цен, характеристики и отзывы на все товары.
          </p>
        </div>

        {/* Product List with Sidebar — категории верхнего уровня */}
        <CatalogProductList
          categorySlug={null}
          initialData={{ ...initialData, children: categories }}
          isRootCatalog
        />
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  try {
    // Категории верхнего уровня
    const catRes = await catalogAPI.getCategories({ level: 0 });
    const categories = catRes.data.results || catRes.data || [];

    // Первые 20 товаров (по рейтингу)
    const prodRes = await catalogAPI.getProducts({
      page: 1,
      page_size: 20,
      ordering: '-avg_rating',
    });
    const products = prodRes.data.results || prodRes.data;
    const totalCount = prodRes.data.count || products.length;

    return {
      props: {
        categories,
        initialData: {
          products,
          children: categories,
          category: { name: 'Каталог', slug: 'catalog' },
          totalCount,
        },
      },
    };
  } catch (err) {
    console.error('SSR Error:', err.message);
    return {
      props: {
        categories: [],
        initialData: {
          products: [],
          children: [],
          category: { name: 'Каталог', slug: 'catalog' },
          totalCount: 0,
        },
      },
    };
  }
}
