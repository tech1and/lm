import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, Heart, MessageCircle, Eye, ArrowRight } from 'lucide-react';

export default function StoreCard({ store, rank }) {
  const getRankClass = (rank) => {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return 'rank-other';
  };

  const getRankEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  return (
    <div className="flex gap-4 p-4 rounded-xl border border-gray-200 bg-white h-full hover:shadow-card-hover hover:-translate-y-1 transition-all duration-250">
      {/* Rank */}
      {rank && (
        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-lg ${getRankClass(rank)}`}>
          {rank <= 3 ? getRankEmoji(rank) : rank}
        </div>
      )}

      {/* Logo */}
      <div className="flex-shrink-0 w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
        {store.logo ? (
          <Image
            src={store.logo}
            alt={store.name}
            width={56}
            height={56}
            className="rounded-xl object-cover"
          />
        ) : (
          <span className="text-3xl">🏪</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
          <div>
            <Link href={`/shops/${store.slug}`} className="text-decoration-none">
              <h3 className="text-base font-bold text-gray-900 hover:text-blue-600 transition-colors mb-1">
                {store.name}
              </h3>
            </Link>
            {store.district && (
              <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-xs">
                <MapPin className="w-3 h-3 text-red-500" />
                {store.district}
              </span>
            )}
          </div>
          <div className="rating-badge flex-shrink-0">
            <Star className="w-3.5 h-3.5 fill-current" />
            {Number(store.rating).toFixed(1)}
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
          {store.short_description?.slice(0, 120)}
          {store.short_description?.length > 120 ? '...' : ''}
        </p>

        <div className="flex flex-wrap items-center gap-4">
          {/* Stats */}
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            {store.likes_count?.toLocaleString('ru')}
          </span>
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <MessageCircle className="w-4 h-4 text-blue-600" />
            {store.comments_count?.toLocaleString('ru')}
          </span>
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Eye className="w-4 h-4 text-green-600" />
            {store.views_count?.toLocaleString('ru')}
          </span>

          {/* Price */}
          {store.min_price && (
            <span className="text-sm font-semibold text-green-600">
              от {store.min_price} ₽
            </span>
          )}

          {/* CTA */}
          <Link
            href={`/shops/${store.slug}`}
            className="inline-flex items-center gap-1 ml-auto text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          >
            Подробнее
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
