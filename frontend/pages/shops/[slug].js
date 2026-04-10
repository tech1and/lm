import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import LikeButton from '../../components/LikeButton';
import CommentForm from '../../components/CommentForm';
import SimilarStores from '../../components/SimilarStores';
import Logo from '../../components/Logo';
import Link from 'next/link';
import { useState } from 'react';
import { shopsAPI } from '../../lib/api';
import {
  Star, MapPin, Phone, Globe, Clock, Truck, Wrench, Shield, CreditCard,
  MapPin as MapPinIcon, ChevronRight, Home, Trophy, ThumbsUp, MessageSquare, Eye, ExternalLink
} from 'lucide-react';

export default function StorePage({ store, error }) {
  const router = useRouter();
  const [comments, setComments] = useState(store?.comments || []);

  if (router.isFallback) {
    return (
      <Layout title="Загрузка..." description="">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Загрузка данных магазина...</p>
        </div>
      </Layout>
    );
  }

  if (error || !store) {
    return (
      <Layout title="Магазин не найден" description="Запрашиваемый магазин не найден" canonical="https://lemanas.ru">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-3xl font-bold mb-3">Магазин не найден</h1>
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

  const features = [
    store.has_parking && { icon: MapPin, label: 'Парковка' },
    store.has_toilet && { icon: Home, label: 'Туалет' },
    store.has_available_environment && { icon: Shield, label: 'Доступная среда' },
    store.has_cafe && { icon: Trophy, label: 'Кафе' },
    store.has_wifi && { icon: Globe, label: 'Wi-Fi' },
    store.has_cash_machine && { icon: CreditCard, label: 'Банкоматы' },
    store.has_cargo && { icon: Truck, label: 'Грузовое такси' },
    store.has_delivery && { icon: Truck, label: 'Доставка из магазина' },
    store.has_pickup && { icon: Home, label: 'Самовывоз' },
    store.has_credit && { icon: CreditCard, label: 'Кредиты' },
    store.has_returns && { icon: Shield, label: 'Возврат товаров' },
    store.has_tool_checking && { icon: Wrench, label: 'Проверка техники' },
    store.has_service_center && { icon: Wrench, label: 'Сервисный центр' },
  ].filter(Boolean);

  // Перемешиваем в случайном порядке
  const shuffledFeatures = features.sort(() => Math.random() - 0.5);

  const siteUrl = 'https://lemanas.ru';
  const canonical = `${siteUrl}/shops/${store.slug}`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Главная", "item": siteUrl },
      { "@type": "ListItem", "position": 2, "name": "Рейтинг магазинов", "item": `${siteUrl}/rating` },
      { "@type": "ListItem", "position": 3, "name": store.name, "item": canonical },
    ],
  };

  const combinedSchema = [store.schema_org, breadcrumbSchema].filter(Boolean);

  return (
    <Layout
      title={store.meta_title}
      description={store.meta_description}
      canonical={canonical}
      schema={combinedSchema}
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
            <Link href="/rating" className="hover:text-gray-700">
              Рейтинг магазинов
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{store.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-dark-800 to-dark-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
          <div className="flex flex-col lg:flex-row items-start gap-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              <div className="bg-white rounded-2xl p-2 w-24 h-24 flex items-center justify-center">
                {store.logo ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}${store.logo}`}
                    alt={store.name}
                    className="rounded-xl w-20 h-20 object-cover"
                  />
                ) : (
                  <Logo size={64} />
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="rating-badge">
                  <Star className="w-4 h-4 fill-current" />
                  {Number(store.rating).toFixed(1)}
                </span>
                {store.district && (
                  <span className="inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm">
                    <MapPin className="w-4 h-4" />
                    {store.district}
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-black mb-2">{store.name}</h1>
              <p className="text-gray-300 text-sm sm:text-base">{store.short_description}</p>
            </div>

            {/* Like Button */}
            <div className="hidden lg:block flex-shrink-0">
              <LikeButton
                slug={store.slug}
                initialLikes={store.likes_count}
                initialLiked={store.user_liked}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="lm-card p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="stat-item border-r border-gray-200">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <ThumbsUp className="w-5 h-5 text-red-500" />
                    <span className="stat-value text-red-500">
                      {store.likes_count?.toLocaleString('ru')}
                    </span>
                  </div>
                  <div className="stat-label">Лайков</div>
                </div>
                <div className="stat-item border-r border-gray-200">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <span className="stat-value text-blue-600">
                      {store.comments_count?.toLocaleString('ru')}
                    </span>
                  </div>
                  <div className="stat-label">Отзывов</div>
                </div>
                <div className="stat-item">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Eye className="w-5 h-5 text-green-600" />
                    <span className="stat-value text-green-600">
                      {store.views_count?.toLocaleString('ru')}
                    </span>
                  </div>
                  <div className="stat-label">Просмотров</div>
                </div>
              </div>
            </div>

            {/* Like Button Mobile */}
            <div className="lg:hidden">
              <LikeButton
                slug={store.slug}
                initialLikes={store.likes_count}
                initialLiked={store.user_liked}
              />
            </div>

            {/* Description */}
            <div className="lm-card p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-sm">ℹ️</span>
                </span>
                О магазине
              </h2>
              <div
                className="text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: store.description.replace(/\n/g, '<br>') }}
              />
            </div>

            {/* Features */}
            {features.length > 0 && (
              <div className="lm-card p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-sm">✅</span>
                  </span>
                  Услуги
                </h2>
                <div className="flex flex-wrap gap-3">
                  {shuffledFeatures.map(f => {
                    const Icon = f.icon;
                    return (
                      <span key={f.label} className="feature-badge">
                        <Icon className="w-4 h-4" />
                        {f.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Map */}
            {store.latitude && store.longitude && (
              <div className="lm-card p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-cyan-100 text-cyan-600 rounded-lg flex items-center justify-center">
                    <MapPinIcon className="w-4 h-4" />
                  </span>
                  Местоположение
                </h2>
                <div className="map-placeholder">
                  <div className="text-center">
                    <MapPinIcon className="w-16 h-16 text-red-500 mx-auto mb-2" />
                    <strong className="text-lg">{store.address}</strong>
                    <br />
                    <span className="text-gray-500 text-sm">
                      {store.district && `${store.district}, `}{store.city}
                    </span>
                    <br />
                    <a
                      href={`https://maps.yandex.ru/?text=${encodeURIComponent(store.address || store.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-4 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                    >
                      <MapPinIcon className="w-4 h-4" />
                      Открыть на Яндекс.Картах
                    </a>
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-500 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Координаты: {store.latitude}, {store.longitude}
                </div>
              </div>
            )}

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
                slug={store.slug}
                onCommentAdded={handleCommentAdded}
              />
            </div>

            {/* Similar Stores */}
            <div className="lm-card p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-sm">🏪</span>
                </span>
                Похожие магазины
              </h2>
              <SimilarStores slug={store.slug} />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              {/* Info Card */}
              <div className="lm-card p-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                  Информация
                </h3>

                <ul className="space-y-4">
                  {store.phone && (
                    <li>
                      <div className="text-xs text-gray-500 mb-1">Телефон</div>
                      <a href={`tel:${store.phone}`} className="flex items-center gap-2 font-semibold text-gray-900 hover:text-green-600 transition-colors">
                        <Phone className="w-4 h-4 text-green-600" />
                        {store.phone}
                      </a>
                    </li>
                  )}

                  {store.external_link && (
                    <li>
                      <div className="text-xs text-gray-500 mb-1">Сайт</div>
                      <a
                        href={store.external_link}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="flex items-center gap-2 font-semibold text-blue-600 hover:underline"
                      >
                        <Globe className="w-4 h-4" />
                        Перейти на lemanapro.ru
                      </a>
                    </li>
                  )}

                  {store.address && (
                    <li>
                      <div className="text-xs text-gray-500 mb-1">Адрес</div>
                      <span className="flex items-center gap-2 font-semibold">
                        <MapPin className="w-4 h-4 text-red-500" />
                        {store.address}
                      </span>
                    </li>
                  )}

                  {store.working_hours && (
                    <li>
                      <div className="text-xs text-gray-500 mb-1">Часы работы</div>
                      <span className="flex items-center gap-2 font-semibold">
                        <Clock className="w-4 h-4 text-blue-500" />
                        {store.working_hours}
                      </span>
                    </li>
                  )}
                </ul>

                {/* Pricing */}
                {(store.min_price || store.price_range) && (
                  <>
                    <hr className="my-4 border-gray-200" />
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                      Цены
                    </h3>
                    <div className="space-y-3">
                      {store.min_price && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Минимальная цена</span>
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold text-sm">
                            от {store.min_price} ₽
                          </span>
                        </div>
                      )}
                      {store.price_range && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Ценовой диапазон</span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">
                            {store.price_range}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* CTA */}
                {store.external_link && (
                  <a
                    href={store.external_link}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="flex items-center justify-center gap-2 w-full mt-6 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-bold transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Перейти на lemanapro.ru
                  </a>
                )}

                {store.phone && (
                  <a
                    href={`tel:${store.phone}`}
                    className="flex items-center justify-center gap-2 w-full mt-3 border-2 border-green-600 text-green-600 hover:bg-green-50 px-6 py-3 rounded-xl font-bold transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    Позвонить
                  </a>
                )}
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
    const res = await shopsAPI.getDetail(params.slug);
    return {
      props: {
        store: res.data,
      },
    };
  } catch (err) {
    if (err.response?.status === 404) {
      return { notFound: true };
    }
    return {
      props: {
        store: null,
        error: 'Ошибка загрузки данных',
      },
    };
  }
}
