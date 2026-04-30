import Layout from '../components/Layout';
import RatingList from '../components/RatingList';
import { Trophy, Home, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { shopsAPI } from '../lib/api';

export default function RatingPage({ stores }) {
  const ratingSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Рейтинг магазинов Лемана Про — Все магазины",
    "url": `${process.env.NEXT_PUBLIC_SITE_URL}/rating`,
    "description": "Полный рейтинг всех магазинов Лемана Про. Сравнивайте, выбирайте лучший магазин.",
  };

  return (
    <Layout
      title="Рейтинг магазинов Лемана Про 2026 — Все магазины"
      description="Полный рейтинг всех магазинов Лемана Про. Сравнивайте цены, читайте отзывы, выбирайте лучший магазин."
      canonical={`${process.env.NEXT_PUBLIC_SITE_URL}/rating`}
      schema={ratingSchema}
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
            <span className="text-gray-900 font-medium">Рейтинг магазинов</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <span className="inline-block bg-primary-500 text-dark-800 px-4 py-1.5 rounded-full font-bold text-sm mb-4">
            🏆 Полный рейтинг
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mb-3">
            Все магазины Лемана Про
          </h1>
          <p className="text-gray-500 text-lg">
            Полный рейтинг магазинов Лемана Про по мнению пользователей.
            Сравнивайте цены, читайте отзывы, выбирайте лучший магазин.
          </p>
        </div>

        <RatingList initialData={stores} initialSortBy="rating" />
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  try {
    const res = await shopsAPI.getList({ ordering: '-rating', page_size: 20 });
    const data = res.data.results || res.data;

    return {
      props: {
        stores: data || [],
      },
    };
  } catch (err) {
    console.error('SSR Error:', err.message);
    return {
      props: {
        stores: [],
      },
    };
  }
}
