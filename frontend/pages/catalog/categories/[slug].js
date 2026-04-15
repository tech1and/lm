import Layout from '../../../components/Layout';
import CatalogProductList from '../../../components/CatalogProductList';
import Link from 'next/link';
import { FolderOpen, ChevronRight, Home } from 'lucide-react';
import { catalogAPI } from '../../../lib/api';

export default function CategoryPage({ category, children, products, error }) {
  if (error || !category) {
    return (
      <Layout title="Категория не найдена" description="">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-3xl font-bold mb-3">Категория не найдена</h1>
          <p className="text-gray-500 mb-6">Возможно, страница была удалена или перемещена.</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
            <Home className="w-5 h-5" />
            На главную
          </Link>
        </div>
      </Layout>
    );
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Главная", "item": process.env.NEXT_PUBLIC_SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Каталог", "item": `${process.env.NEXT_PUBLIC_SITE_URL}/catalog` },
      { "@type": "ListItem", "position": 3, "name": category.name, "item": `${process.env.NEXT_PUBLIC_SITE_URL}/catalog/categories/${category.slug}` },
    ],
  };

  const initialData = {
    products,
    children,
    category,
  };

  return (
    <Layout
      title={`${category.name} — Каталог товаров`}
      description={category.meta_description || `Товары категории ${category.name}. Сравнение цен, характеристики, отзывы.`}
      canonical={`${process.env.NEXT_PUBLIC_SITE_URL}/catalog/categories/${category.slug}`}
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
            <Link href="/catalog" className="hover:text-gray-700">
              Каталог
            </Link>
            {category.path && category.path.length > 1 && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900 font-medium">{category.name}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <span className="inline-block bg-primary-500 text-dark-800 px-4 py-1.5 rounded-full font-bold text-sm mb-4">
            📦 Каталог
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mb-3 flex items-center gap-3">
            <FolderOpen className="w-8 h-8 text-primary-500" />
            {category.name}
          </h1>
          {category.meta_description && (
            <p className="text-gray-500 text-lg">
              {category.meta_description}
            </p>
          )}
        </div>

        {/* Product List with Sidebar */}
        <CatalogProductList
          categorySlug={category.slug}
          initialData={initialData}
        />
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const res = await catalogAPI.getCategoryProducts(params.slug, {
      page: 1,
      page_size: 20,
      ordering: '-avg_rating',
    });

    const data = res.data;

    return {
      props: {
        category: data.category || null,
        children: data.children || [],
        products: data.results || [],
      },
    };
  } catch (err) {
    if (err.response?.status === 404) {
      return {
        props: {
          category: null,
          children: [],
          products: [],
          error: 'not_found',
        },
      };
    }

    console.error('SSR Error:', err.message);
    return {
      props: {
        category: null,
        children: [],
        products: [],
        error: err.message,
      },
    };
  }
}
