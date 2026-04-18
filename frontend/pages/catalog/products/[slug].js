import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import LikeButton from '../../../components/LikeButton';
import CommentForm from '../../../components/CommentForm';
import Link from 'next/link';
import { useState } from 'react';
import { catalogAPI } from '../../../lib/api';
import {
  Star, Heart, MessageCircle, Eye, Inbox, ChevronRight, Home,
  ThumbsUp, MessageSquare, ShoppingCart, Truck, Shield, CheckCircle,
  AlertCircle, Tag, Package
} from 'lucide-react';

export default function ProductPage({ product, error }) {
  const router = useRouter();
  const [comments, setComments] = useState(product?.comments || []);

  if (router.isFallback) {
    return (
      <Layout title="Загрузка..." description="">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Загрузка данных товара...</p>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout title="Товар не найден" description="Запрашиваемый товар не найден" canonical="https://lemanas.ru">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-3xl font-bold mb-3">Товар не найден</h1>
          <p className="text-gray-500 mb-6">Возможно, страница была удалена или перемещена.</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
            <Home className="w-5 h-5" />
            На главную
          </Link>
        </div>
      </Layout>
    );
  }

  const handleCommentAdded = (newComment) => {
    setComments(prev => [newComment, ...prev]);
  };

  const siteUrl = 'https://lemanas.ru';
  const canonical = `${siteUrl}/catalog/products/${product.slug}`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Главная", "item": siteUrl },
      { "@type": "ListItem", "position": 2, "name": "Каталог", "item": `${siteUrl}/catalog` },
      ...(product.category ? [
        { "@type": "ListItem", "position": 3, "name": product.category.name, "item": `${siteUrl}/catalog/categories/${product.category.slug}` },
      ] : []),
      { "@type": "ListItem", "position": product.category ? 4 : 3, "name": product.name, "item": canonical },
    ],
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.short_description || product.description,
    "image": product.images?.[0] || '',
    "brand": {
      "@type": "Brand",
      "name": product.brand || 'Не указан',
    },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "RUB",
      "availability": product.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    "aggregateRating": product.avg_rating > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": product.avg_rating.toFixed(1),
      "reviewCount": product.reviews_count || 0,
    } : undefined,
  };

  const combinedSchema = [breadcrumbSchema, productSchema].filter(Boolean);

  return (
    <Layout
      title={product.meta_title || `${product.name} — Купить за ${product.price} ₽`}
      description={product.meta_description || product.short_description || `Купить ${product.name} по цене ${product.price} ₽. Характеристики, отзывы, рейтинг.`}
      canonical={canonical}
      schema={combinedSchema}
    >
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap" aria-label="breadcrumb">
            <Link href="/" className="hover:text-gray-700 flex items-center gap-1">
              <Home className="w-4 h-4" />
              Главная
            </Link>
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
            <Link href="/catalog" className="hover:text-gray-700">
              Каталог
            </Link>
            {product.category && (
              <>
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
                <Link href={`/catalog/categories/${product.category.slug}`} className="hover:text-gray-700">
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
            <span className="text-gray-900 font-medium truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Images */}
            <div className="lm-card p-6">
              {product.images && product.images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {product.images.map((img, idx) => (
                    <div key={idx} className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                      <img
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                  <Inbox className="w-24 h-24 text-gray-400" />
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="lm-card p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-sm">ℹ️</span>
                  </span>
                  Описание
                </h2>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="lm-card p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Package className="w-6 h-6 text-purple-600" />
                  Характеристики
                </h2>
                <div className="space-y-3">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-gray-500 text-sm">{key}</span>
                      <span className="font-medium text-gray-900 text-sm">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <div className="lm-card p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="stat-item">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="stat-value text-yellow-500 text-xl">
                      {product.avg_rating > 0 ? Number(product.avg_rating).toFixed(1) : '—'}
                    </span>
                  </div>
                  <div className="stat-label">Рейтинг</div>
                </div>
                <div className="stat-item border-l border-gray-200">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <ThumbsUp className="w-5 h-5 text-red-500" />
                    <span className="stat-value text-red-500 text-xl">
                      {product.likes_count?.toLocaleString('ru') || 0}
                    </span>
                  </div>
                  <div className="stat-label">Лайков</div>
                </div>
                <div className="stat-item border-l border-gray-200">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <span className="stat-value text-blue-600 text-xl">
                      {product.reviews_count?.toLocaleString('ru') || 0}
                    </span>
                  </div>
                  <div className="stat-label">Отзывов</div>
                </div>
                <div className="stat-item border-l border-gray-200">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Eye className="w-5 h-5 text-green-600" />
                    <span className="stat-value text-green-600 text-xl">
                      {product.views_count?.toLocaleString('ru') || 0}
                    </span>
                  </div>
                  <div className="stat-label">Просмотров</div>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="lm-card p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-sm">💬</span>
                </span>
                Отзывы ({comments.length})
              </h2>

              {comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>Пока нет отзывов. Будьте первым!</p>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  {comments.map(comment => (
                    <div key={comment.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-400 flex items-center justify-center font-bold text-sm text-white">
                            {comment.author_name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <strong className="text-sm">{comment.author_name}</strong>
                            <div className="text-xs text-gray-500">
                              {new Date(comment.created_at).toLocaleDateString('ru-RU', {
                                year: 'numeric', month: 'long', day: 'numeric'
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < comment.rating ? 'text-primary-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{comment.text}</p>
                    </div>
                  ))}
                </div>
              )}

              <CommentForm
                slug={product.slug}
                type="product"
                onCommentAdded={handleCommentAdded}
              />
            </div>
          </div>

          {/* Right Sidebar - Buy Block */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              {/* Buy Card */}
              <div className="lm-card p-6">
                <div className="mb-4">
                  <h1 className="text-2xl font-black text-gray-900 mb-2">{product.name}</h1>
                  {product.brand && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <Tag className="w-4 h-4" />
                      <span className="font-medium text-primary-600">{product.brand}</span>
                    </div>
                  )}
                </div>

                {/* Rating */}
                {product.avg_rating > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="rating-badge">
                      <Star className="w-4 h-4 fill-current" />
                      {Number(product.avg_rating).toFixed(1)}
                    </div>
                    <span className="text-sm text-gray-500">
                      ({product.reviews_count || 0} отзывов)
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-4">
                  <div className="text-3xl font-black text-gray-900 mb-1">
                    {product.price.toLocaleString('ru-RU')} ₽
                  </div>
                  {product.old_price && product.old_price > product.price && (
                    <div className="text-sm text-gray-400 line-through">
                      {product.old_price.toLocaleString('ru-RU')} ₽
                    </div>
                  )}
                </div>

                {/* Stock Status */}
                <div className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-lg ${
                  product.in_stock 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  {product.in_stock ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold text-sm">В наличии</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-semibold text-sm">Нет в наличии</span>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 mb-4">
                  <button 
                    className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                      product.in_stock
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                    disabled={!product.in_stock}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {product.in_stock ? 'Добавить в корзину' : 'Нет в наличии'}
                  </button>

                  <LikeButton
                    slug={product.slug}
                    type="product"
                    initialLikes={product.likes_count}
                    initialLiked={product.user_liked}
                  />
                </div>

                {/* Delivery Info */}
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span>Доставка по России</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>Гарантия качества</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package className="w-4 h-4 text-purple-600" />
                    <span>Быстрая отправка</span>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="lm-card p-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                  Информация
                </h3>

                <ul className="space-y-3 text-sm">
                  {product.article && (
                    <li className="flex justify-between">
                      <span className="text-gray-500">Артикул:</span>
                      <span className="font-medium">{product.article}</span>
                    </li>
                  )}
                  {product.category && (
                    <li>
                      <span className="text-gray-500 block mb-1">Категория:</span>
                      <Link 
                        href={`/catalog/categories/${product.category.slug}`}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {product.category.name}
                      </Link>
                    </li>
                  )}
                  <li className="flex justify-between">
                    <span className="text-gray-500">Просмотры:</span>
                    <span className="font-medium">{product.views_count?.toLocaleString('ru') || 0}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const res = await catalogAPI.getProduct(params.slug);
    const data = res.data;

    // Получаем комментарии для товара
    let comments = [];
    try {
      const commentsRes = await catalogAPI.getProduct(params.slug);
      comments = commentsRes.data.comments || [];
    } catch (e) {
      console.error('Ошибка загрузки комментариев:', e);
    }

    return {
      props: {
        product: {
          ...data,
          comments,
        } || null,
      },
    };
  } catch (err) {
    if (err.response?.status === 404) {
      return {
        props: {
          product: null,
          error: 'not_found',
        },
      };
    }

    console.error('SSR Error:', err.message);
    return {
      props: {
        product: null,
        error: err.message,
      },
    };
  }
}
