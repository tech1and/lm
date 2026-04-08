import { useState, useEffect } from 'react';
import { shopsAPI } from '../lib/api';
import StoreCard from './StoreCard';
import { Star, Heart, MessageCircle, Eye, Inbox, Loader2 } from 'lucide-react';

const SORT_OPTIONS = [
  { key: 'rating', label: 'Рейтинг', icon: Star, param: 'ordering', value: '-rating' },
  { key: 'likes_count', label: 'Лайки', icon: Heart, param: 'ordering', value: '-likes_count' },
  { key: 'comments', label: 'Отзывы', icon: MessageCircle, param: 'sort_by', value: 'comments' },
  { key: 'views_count', label: 'Просмотры', icon: Eye, param: 'ordering', value: '-views_count' },
];

export default function SimilarStores({ slug }) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('rating');
  const [transitioning, setTransitioning] = useState(false);

  const fetchStores = async (sort) => {
    setTransitioning(true);
    try {
      const sortOption = SORT_OPTIONS.find(opt => opt.key === sort);
      const params = {};
      if (sortOption) {
        params[sortOption.param] = sortOption.value;
      }

      const res = await shopsAPI.getSimilar(slug, params);
      const results = res.data || [];

      setTimeout(() => {
        setStores(results);
        setTransitioning(false);
        setLoading(false);
      }, 200);
    } catch (err) {
      console.error('Ошибка загрузки похожих магазинов:', err);
      setTransitioning(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores(sortBy);
  }, [sortBy, slug]);

  const handleSort = (sort) => {
    if (sort === sortBy) return;
    setLoading(true);
    setSortBy(sort);
  };

  return (
    <div>
      {/* Sort Controls */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="font-semibold text-gray-500">Сортировка:</span>
        {SORT_OPTIONS.map(opt => {
          const Icon = opt.icon;
          const isActive = sortBy === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => handleSort(opt.key)}
              className={`sort-btn flex items-center gap-1.5 border-2 transition-all ${
                isActive
                  ? 'border-primary-400 bg-primary-50 text-primary-700 font-bold shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'fill-current' : ''}`} />
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity duration-200"
        style={{ opacity: transitioning ? 0.4 : 1 }}
      >
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-xl border border-gray-200 bg-white animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <div className="flex gap-3 items-center mb-3">
                  <div className="h-5 bg-gray-200 rounded w-32" />
                  <div className="h-6 bg-gray-200 rounded-full w-16" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded w-48" />
              </div>
            </div>
          ))
        ) : stores.length > 0 ? (
          stores.map((store, i) => (
            <StoreCard
              key={store.id}
              store={store}
              rank={null}
            />
          ))
        ) : (
          <div className="col-span-2 text-center py-12 text-gray-500">
            <Inbox className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>Нет похожих магазинов</p>
          </div>
        )}
      </div>

      {/* Count info */}
      {!loading && stores.length > 0 && (
        <p className="text-gray-500 text-sm text-center mt-6">
          Найдено {stores.length} похожих магазинов поблизости
        </p>
      )}
    </div>
  );
}
