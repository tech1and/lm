import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import LikeButton from '../../../components/LikeButton';
import CommentForm from '../../../components/CommentForm';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { catalogAPI } from '../../../lib/api';
import {
  Star, Heart, MessageCircle, Eye, Inbox, ChevronRight, Home,
  ThumbsUp, MessageSquare, ShoppingCart, Truck, Shield, CheckCircle,
  AlertCircle, Tag, Package, Play
} from 'lucide-react';

// Helper function to format price without decimals
const formatPrice = (price) => {
  return Math.floor(Number(price)).toLocaleString('ru-RU');
};

export default function ProductPage({ product, similarProducts, error }) {
  const router = useRouter();
  const [comments, setComments] = useState(product?.comments || []);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewsCount, setViewsCount] = useState(product?.views_count || 0);
  const [likesCount, setLikesCount] = useState(product?.likes_count || 0);
  const [liked, setLiked] = useState(product?.user_liked || false);
  const [likeLoading, setLikeLoading] = useState(false);

  // Increment view count on page load
  useEffect(() => {
    const incrementView = async () => {
      try {
        // Fetch the product again to get updated views count
        const res = await catalogAPI.getProduct(product.slug);
        if (res.data) {
          setViewsCount(res.data.views_count);
          setLikesCount(res.data.likes_count);
          setLiked(res.data.user_liked);
        }
      } catch (err) {
        console.error('Error incrementing view:', err);
      }
    };
    
    if (product && product.slug) {
      incrementView();
    }
  }, [product]);

  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const res = await catalogAPI.like(product.slug);
      setLikesCount(res.data.likes_count);
      setLiked(res.data.liked);
    } catch (err) {
      console.error('Ошибка лайка:', err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleLikeOnImage = async (e, imageIndex) => {
    e.stopPropagation();
    e.preventDefault();
    await handleLike();
  };

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
      title={product.meta_title ? product.meta_title : `${product.name} — Купить за ${formatPrice(product.price)} ₽`}
      description={product.meta_description || product.short_description || `Купить ${product.name} по цене ${formatPrice(product.price)} ₽. Характеристики, отзывы, рейтинг.`}
      canonical={canonical}
      schema={combinedSchema}
      keywords={product.meta_keywords}
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
          {/* Right Sidebar - Buy Block (visually on right) */}
          <div className="lg:col-span-1 order-last lg:order-none">
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
                    Цена от {formatPrice(product.price)} ₽
                  </div>
                  {product.old_price && product.old_price > product.price && (
                    <div className="text-sm text-gray-400 line-through">
                      {formatPrice(product.old_price)} ₽
                    </div>
                  )}
                </div>

                {/* Stock Status with Article */}
                <div className={`flex items-center justify-between gap-2 mb-4 px-3 py-2 rounded-lg ${
                  product.in_stock 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  <div className="flex items-center gap-2">
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
                  {product.xml_id && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(product.xml_id);
                      }}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-600 cursor-pointer transition-colors"
                      title="Нажмите, чтобы скопировать артикул"
                    >
                      <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-qa="copy-button" data-icons-pack="svg" className="w-4 h-4">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.75 15.75h4.5v-12h-12v4.5m-4.5 0h12v12h-12v-12z"></path>
                      </svg>
                      <span className="font-mono">{product.xml_id}</span>
                    </button>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 mb-4">
                  <a
                    href={`https://lemanas.ru/go/?url=${encodeURIComponent(product.url)}`}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                      product.in_stock
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Проверить наличие и цену
                  </a>

                  <LikeButton
                    slug={product.slug}
                    type="product"
                    initialLikes={likesCount}
                    initialLiked={liked}
                  />
                </div>

                {/* Delivery Info */}
                <div className="border-t border-gray-200 pt-4">
                  <dl className="space-y-3">
                    <div className="flex items-baseline gap-4 border-t border-gray-100 pt-3 first:border-none first:pt-0 dark:border-white/5">
                      <dt className="text-neutral-500 min-w-[150px] dark:text-neutral-400">
                        Самовывоз сегодня
                      </dt>
                      <dd className="text-neutral-950 dark:text-white">
                        бесплатно
                      </dd>
                    </div>
                    <div className="flex items-baseline gap-4 border-t border-gray-100 pt-3 first:border-none first:pt-0 dark:border-white/5">
                      <dt className="text-neutral-500 min-w-[150px] dark:text-neutral-400">
                        В пункте выдачи до {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()} {new Date().toLocaleString('ru-RU', { month: 'long' })}
                      </dt>
                      <dd className="text-neutral-950 dark:text-white">
                        от 1 ₽
                      </dd>
                    </div>
                    <div className="flex items-baseline gap-4 border-t border-gray-100 pt-3 first:border-none first:pt-0 dark:border-white/5">
                      <dt className="text-neutral-500 min-w-[150px] dark:text-neutral-400">
                        Доставим завтра
                      </dt>
                      <dd className="text-neutral-950 dark:text-white">
                        от 490 ₽
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Additional Info */}
              <div className="lm-card p-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                  Информация
                </h3>

                <ul className="space-y-3 text-sm">
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
                </ul>
              </div>
            </div>
          </div>

          {/* Left Column - Images & Details (visually on left, first in DOM for SEO) */}
          <div className="lg:col-span-2 order-first lg:order-none space-y-6">
             {/* Product Images Gallery */}
             <div className="lm-card p-6">
               {product.images && product.images.length > 0 ? (
                 <div className="relative w-full overflow-hidden rounded-2xl">
                   <div className="group/cardGallerySlider group relative">
                     <div className="w-full overflow-hidden rounded-xl">
                       <div className="relative w-full max-h-[70vh] lg:max-h-[80vh] flex items-center justify-center bg-gray-50">
                         {product.video_source && currentImageIndex === product.images.length ? (
                           <video 
                             title={`Видео ${product.name}`} 
                             poster={product.images[0]}
                             controls
                             className="max-w-full max-h-full object-contain rounded-xl"
                           >
                             <source src={product.video_source} type="video/mp4" />
                             Ваш браузер не поддерживает видео.
                           </video>
                         ) : (
                           <img
                             alt={product.name}
                             loading="lazy"
                             decoding="async"
                             className="max-w-full max-h-full object-contain rounded-xl"
                             src={product.images[currentImageIndex]}
                           />
                         )}
                       </div>
                     </div>
                     
                     {/* Navigation Button - Next */}
                     {(product.images.length > 1 || product.video_source) && (
                       <>
                         <div className="opacity-0 transition-opacity group-hover/cardGallerySlider:opacity-100">
                           <div className="absolute end-3 top-[calc(50%-1rem)]">
                             <button
                               onClick={() => setCurrentImageIndex((prev) => {
                                 const maxIdx = product.video_source ? product.images.length : product.images.length - 1;
                                 return (prev + 1) > maxIdx ? 0 : prev + 1;
                               })}
                               className="size-8! relative isolate inline-flex shrink-0 items-center justify-center rounded-full border font-medium size-10 text-sm/none focus:not-data-focus:outline-hidden data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-blue-500 data-disabled:opacity-50 *:data-[slot=icon]:-mx-0.5 *:data-[slot=icon]:my-0.5 *:data-[slot=icon]:size-5 *:data-[slot=icon]:shrink-0 *:data-[slot=icon]:self-center sm:*:data-[slot=icon]:my-1 sm:*:data-[slot=icon]:size-5 forced-colors:[--btn-icon:ButtonText] forced-colors:data-hover:[--btn-icon:ButtonText] border-transparent bg-(--btn-border) dark:bg-(--btn-bg) before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-(--btn-bg) dark:before:hidden dark:border-white/5 after:absolute after:inset-0 after:-z-10 after:rounded-full data-active:after:bg-(--btn-hover-overlay) data-hover:after:bg-(--btn-hover-overlay) dark:after:-inset-px dark:after:rounded-full data-disabled:before:shadow-none data-disabled:after:shadow-none text-neutral-950 [--btn-bg:white] [--btn-border:var(--color-neutral-950)]/10 [--btn-hover-overlay:var(--color-neutral-950)]/[2.5%] data-active:[--btn-border:var(--color-neutral-950)]/15 data-hover:[--btn-border:var(--color-neutral-950)]/15 dark:[--btn-hover-overlay:var(--color-neutral-950)]/5 [--btn-icon:var(--color-neutral-400)] data-active:[--btn-icon:var(--color-neutral-500)] data-hover:[--btn-icon:var(--color-neutral-500)] cursor-pointer hover:bg-white/90"
                               type="button"
                               aria-label="Следующее изображение"
                             >
                               <span className="absolute top-1/2 left-1/2 size-[max(100%,2.75rem)] -translate-x-1/2 -translate-y-1/2 [@media(pointer:fine)]:hidden" aria-hidden="true"></span>
                               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" className="size-4! rtl:rotate-180">
                                 <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
                               </svg>
                             </button>
                           </div>
                         </div>
                         
                         {/* Previous Button */}
                         <div className="opacity-0 transition-opacity group-hover/cardGallerySlider:opacity-100">
                           <div className="absolute start-3 top-[calc(50%-1rem)]">
                             <button
                               onClick={() => setCurrentImageIndex((prev) => {
                                 const maxIdx = product.video_source ? product.images.length : product.images.length - 1;
                                 return (prev - 1) < 0 ? maxIdx : prev - 1;
                               })}
                               className="size-8! relative isolate inline-flex shrink-0 items-center justify-center rounded-full border font-medium size-10 text-sm/none focus:not-data-focus:outline-hidden data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-blue-500 data-disabled:opacity-50 *:data-[slot=icon]:-mx-0.5 *:data-[slot=icon]:my-0.5 *:data-[slot=icon]:size-5 *:data-[slot=icon]:shrink-0 *:data-[slot=icon]:self-center sm:*:data-[slot=icon]:my-1 sm:*:data-[slot=icon]:size-5 forced-colors:[--btn-icon:ButtonText] forced-colors:data-hover:[--btn-icon:ButtonText] border-transparent bg-(--btn-border) dark:bg-(--btn-bg) before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-(--btn-bg) dark:before:hidden dark:border-white/5 after:absolute after:inset-0 after:-z-10 after:rounded-full data-active:after:bg-(--btn-hover-overlay) data-hover:after:bg-(--btn-hover-overlay) dark:after:-inset-px dark:after:rounded-full data-disabled:before:shadow-none data-disabled:after:shadow-none text-neutral-950 [--btn-bg:white] [--btn-border:var(--color-neutral-950)]/10 [--btn-hover-overlay:var(--color-neutral-950)]/[2.5%] data-active:[--btn-border:var(--color-neutral-950)]/15 data-hover:[--btn-border:var(--color-neutral-950)]/15 dark:[--btn-hover-overlay:var(--color-neutral-950)]/5 [--btn-icon:var(--color-neutral-400)] data-active:[--btn-icon:var(--color-neutral-500)] data-hover:[--btn-icon:var(--color-neutral-500)] cursor-pointer hover:bg-white/90"
                               type="button"
                               aria-label="Предыдущее изображение"
                             >
                               <span className="absolute top-1/2 left-1/2 size-[max(100%,2.75rem)] -translate-x-1/2 -translate-y-1/2 [@media(pointer:fine)]:hidden" aria-hidden="true"></span>
                               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" className="size-4! rotate-180">
                                 <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
                               </svg>
                             </button>
                           </div>
                         </div>
                       </>
                     )}
                     
                     {/* Gradient Overlay */}
                     <div className="absolute inset-x-0 bottom-0 h-10 rounded-b-xl bg-linear-to-t from-neutral-900 opacity-50"></div>
                     
                     {/* Image Indicators with Like Buttons */}
                     <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-x-1.5">
                       {product.images.map((img, idx) => (
                         <div key={idx} className="relative group">
                           <button
                             onClick={() => setCurrentImageIndex(idx)}
                             className={`h-1.5 w-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-3' : 'bg-white/60 hover:bg-white/80'}`}
                             aria-label={`Изображение ${idx + 1}`}
                           ></button>
                           {/* Like button on each thumbnail */}
                           <button 
                             onClick={(e) => handleLikeOnImage(e, idx)}
                             className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex cursor-pointer items-center justify-center rounded-full pt-px transition-colors text-white bg-black/50 hover:bg-black/70 size-6"
                             aria-label={liked ? 'Убрать лайк' : 'Поставить лайк'}
                           >
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" color="#FF385C" fill={liked ? "#FF385C" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                               <path d="M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z"></path>
                             </svg>
                           </button>
                         </div>
                       ))}
                       {product.video_source && (
                         <button
                           key="video"
                           onClick={() => setCurrentImageIndex(product.images.length)}
                           className={`h-1.5 w-1.5 rounded-full transition-all ${currentImageIndex === product.images.length ? 'bg-white w-3' : 'bg-white/60 hover:bg-white/80'}`}
                           aria-label="Видео"
                         >
                           <Play className="w-3 h-3" />
                         </button>
                       )}
                     </div>
                   </div>
                   
                   {/* Like Button */}
                   <button 
                     onClick={handleLike}
                     className="flex cursor-pointer items-center justify-center rounded-full pt-px transition-colors absolute top-3 right-3 text-white bg-black/30 hover:bg-black/50 size-8"
                     aria-label={liked ? 'Убрать лайк' : 'Поставить лайк'}
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="#FF385C" fill={liked ? "#FF385C" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                       <path d="M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z"></path>
                     </svg>
                   </button>
                 </div>
               ) : (
                 <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                   <Inbox className="w-24 h-24 text-gray-400" />
                 </div>
               )}
             </div>

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
                      {likesCount?.toLocaleString('ru') || 0}
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
                      {viewsCount?.toLocaleString('ru') || 0}
                    </span>
                  </div>
                  <div className="stat-label">Просмотров</div>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="lm-card p-0 overflow-hidden">
              <nav className="flex overflow-x-auto scrollbar-hide">
                <a href="#description" className="flex-shrink-0 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors border-b-2 border-transparent hover:border-primary-600 whitespace-nowrap">Описание</a>
                <a href="#specifications" className="flex-shrink-0 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors border-b-2 border-transparent hover:border-primary-600 whitespace-nowrap">Характеристики</a>
                <a href="#similar" className="flex-shrink-0 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors border-b-2 border-transparent hover:border-primary-600 whitespace-nowrap">Похожие</a>
                <a href="#comments" className="flex-shrink-0 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors border-b-2 border-transparent hover:border-primary-600 whitespace-nowrap">Отзывы</a>
                <a href="#faq" className="flex-shrink-0 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors border-b-2 border-transparent hover:border-primary-600 whitespace-nowrap">Вопрос-ответ</a>
              </nav>
            </div>

            {/* Description */}
            {product.description && (
              <div id="description" className="lm-card p-6">
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
            {(product.params || product.weight || product.dimensions) && (
              <div id="specifications" className="lm-card p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Package className="w-6 h-6 text-purple-600" />
                  Характеристики
                </h2>
                <dl className="space-y-3">
                  {product.params && Object.entries(product.params).map(([key, value]) => (
                    <div key={key} className="flex items-baseline gap-4 border-t border-gray-100 pt-3 first:border-none first:pt-0 dark:border-white/5">
                      <dt className="text-neutral-500 min-w-[150px] dark:text-neutral-400">
                        {key}
                      </dt>
                      <dd className="text-neutral-950 dark:text-white">
                        {value}
                      </dd>
                    </div>
                  ))}
                  {product.weight && (
                    <div className="flex items-baseline gap-4 border-t border-gray-100 pt-3 first:border-none first:pt-0 dark:border-white/5">
                      <dt className="text-neutral-500 min-w-[150px] dark:text-neutral-400">
                        Вес
                      </dt>
                      <dd className="text-neutral-950 dark:text-white">
                        {product.weight}
                      </dd>
                    </div>
                  )}
                  {product.dimensions && (
                    <div className="flex items-baseline gap-4 border-t border-gray-100 pt-3 first:border-none first:pt-0 dark:border-white/5">
                      <dt className="text-neutral-500 min-w-[150px] dark:text-neutral-400">
                        Габариты
                      </dt>
                      <dd className="text-neutral-950 dark:text-white">
                        {product.dimensions}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* FAQ */}
            {product.faq && product.faq.trim() !== '' && (
              <div id="faq" className="lm-card p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                  Вопрос-ответ
                </h2>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.faq }}
                />
              </div>
            )}

            {/* Comments */}
            <div id="comments" className="lm-card p-6">
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

            {/* Similar Products */}
            {similarProducts && similarProducts.length > 0 && (
              <div id="similar" className="lm-card p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Package className="w-6 h-6 text-blue-600" />
                  Похожие товары
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4">
                  {similarProducts.map(similarProduct => (
                    <Link
                      key={similarProduct.id}
                      href={`/catalog/products/${similarProduct.slug}`}
                      className="group block border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow dark:border-white/10"
                    >
                      <div className="aspect-square bg-gray-50 overflow-hidden">
                        {similarProduct.images && similarProduct.images[0] ? (
                          <img
                            src={similarProduct.images[0]}
                            alt={similarProduct.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Inbox className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 dark:text-white">
                          {similarProduct.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-base font-bold text-primary-600">
                            {formatPrice(similarProduct.price)} ₽
                          </span>
                          {similarProduct.avg_rating > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Star className="w-3 h-3 fill-current text-yellow-500" />
                              {Number(similarProduct.avg_rating).toFixed(1)}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-50">
        <a
          href={`https://lemanas.ru/go/?url=${encodeURIComponent(product.url)}`}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
            product.in_stock
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          Проверить наличие и цену
        </a>
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

    // Получаем похожие товары через специальный API-метод (6 шт)
    let similarProducts = [];
    try {
      const similarRes = await catalogAPI.getSimilarProducts(params.slug, { limit: 6 });
      similarProducts = (similarRes.data.results || similarRes.data || []).slice(0, 6);
    } catch (e) {
      console.error('Ошибка загрузки похожих товаров:', e);
    }

    return {
      props: {
        product: {
          ...data,
          comments,
        } || null,
        similarProducts,
      },
    };
  } catch (err) {
    if (err.response?.status === 404) {
      return {
        props: {
          product: null,
          similarProducts: [],
          error: 'not_found',
        },
      };
    }

    console.error('SSR Error:', err.message);
    return {
      props: {
        product: null,
        similarProducts: [],
        error: err.message,
      },
    };
  }
}
