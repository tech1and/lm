import Layout from '../components/Layout';
import RatingList from '../components/RatingList';
import { Trophy } from 'lucide-react';

export default function RatingPage() {
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

        <RatingList />
      </div>
    </Layout>
  );
}
