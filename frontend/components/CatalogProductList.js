import { useState, useEffect } from 'react';
import Link from 'next/link';
import { catalogAPI } from '../lib/api';
import { Star, Heart, MessageCircle, Eye, Inbox, ChevronLeft, ChevronRight, FolderOpen } from 'lucide-react';

const SORT_OPTIONS = [
  { key: 'rating', label: 'Рейтинг', icon: Star },
  { key: 'likes_count', label: 'Лайки', icon: Heart },
  { key: 'reviews', label: 'Отзывы', icon: MessageCircle },
  { key: 'views_count', label: 'Просмотры', icon: Eye },
];

export default function CatalogProductList({ categorySlug, initialData, isRootCatalog = false }) {
  const { products: initialProducts, children, category } = initialData || {};

  const [products, setProducts] = useState(initialProducts || []);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [transitioning, setTransitioning] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchProducts = async (sort, page) => {
    setTransitioning(true);
    setLoading(true);
    try {
      let params = { page, page_size: 20 };
      if (sort === 'reviews') {
        params.sort_by = 'reviews';
      } else {
        params.ordering = `-${sort}`;
      }

      let res;
      if (isRootCatalog || !categorySlug) {
        res = await catalogAPI.getProducts(params);
      } else {
        res = await catalogAPI.getCategoryProducts(categorySlug, params);
      }
      const results = res.data.results || [];

      setProducts(results);
      setCurrentPage(page);
      setTotalPages(res.data.total_pages || Math.ceil((res.data.count || results.length) / 20));
      setTotalCount(res.data.count || results.length);
      setTransitioning(false);
      setLoading(false);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
      setTransitioning(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(sortBy, 1);
  }, [sortBy]);

  const handleSort = (sort) => {
    if (sort === sortBy) return;
    setSortBy(sort);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    fetchProducts(sortBy, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar — дочерние категории */}
      {children && children.length > 0 && (
        <aside className="lg:col-span-1">
          <div className="sticky top-20">
            <div className="lm-card p-5">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Подкатегории
              </h3>
              <ul className="space-y-2">
                {children.map(child => (
                  <li key={child.id}>
                    <Link
                      href={`/catalog/categories/${child.slug}`}
                      className="block px-3 py-2 text-sm text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      {child.name}
                      {child.products_count > 0 && (
                        <span className="ml-1 text-xs text-gray-400">({child.products_count})</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      )}

      {/* Main content */}
      <div className={children && children.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4'}>
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

        {/* Product List */}
        <div
          className="flex flex-col gap-4 transition-opacity duration-200"
          style={{ opacity: transitioning ? 0.4 : 1 }}
        >
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl border border-gray-200 bg-white animate-pulse">
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-48 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-32" />
                </div>
              </div>
            ))
          ) : products.length > 0 ? (
            products.map((product, i) => (
              <Link
                key={product.id}
                href={`/catalog/products/${product.slug}`}
                className="lm-card p-4 flex gap-4 hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Inbox className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    {product.brand && (
                      <span className="text-primary-600 font-medium">{product.brand}</span>
                    )}
                    {product.avg_rating > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        {Number(product.avg_rating).toFixed(1)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-0.5">
                      <Heart className="w-3 h-3" />
                      {product.likes_count}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <MessageCircle className="w-3 h-3" />
                      {product.reviews_count}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Eye className="w-3 h-3" />
                      {product.views_count}
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {product.price.toLocaleString('ru-RU')} ₽
                  </div>
                  {product.in_stock ? (
                    <span className="text-xs text-green-600 font-medium">В наличии</span>
                  ) : (
                    <span className="text-xs text-red-500 font-medium">Нет в наличии</span>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Inbox className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>Товары в этой категории не найдены</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              let page;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }

              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                    page === currentPage
                      ? 'bg-primary-500 text-white'
                      : 'border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Count info */}
        {!loading && totalCount > 0 && (
          <p className="text-gray-500 text-sm text-center mt-4">
            Показано {products.length} из {totalCount} товаров
          </p>
        )}
      </div>
    </div>
  );
}
