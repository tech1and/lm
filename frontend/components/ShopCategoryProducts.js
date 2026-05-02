import Link from 'next/link';
import { Star, Heart, MessageCircle, Eye, Inbox } from 'lucide-react';

// Helper function to format price without decimals
const formatPrice = (price) => {
  return Math.floor(Number(price)).toLocaleString('ru-RU');
};

export default function ShopCategoryProducts({ category, products }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="relative py-12">
      <div className="absolute inset-y-0 left-1/2 z-0 w-screen -translate-x-1/2 xl:max-w-[1340px] xl:rounded-[40px] 2xl:max-w-[1340px] bg-neutral-50 dark:bg-black/20"></div>

      {/* Header */}
      <div className="relative mb-12 max-w-2xl mx-auto w-full text-center text-pretty">
        <h2 className="text-3xl font-semibold text-neutral-950 sm:text-4xl/10 dark:text-white">
          {category.name}
        </h2>
        <p className="mt-3.5 text-lg font-normal text-neutral-500 dark:text-neutral-400">
          {/* Здесь может быть SEO текст категории */}
        </p>
      </div>

      {/* Products Grid */}
      <div className="relative mt-8 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 md:gap-x-8 md:gap-y-12 lg:mt-10 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <div key={product.id} className="group relative">
            <Link href={`/catalog/products/${product.slug}`} className="block">
              <div className="relative w-full overflow-hidden rounded-2xl">
                {/* Image */}
                <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      <Inbox className="w-12 h-12" />
                    </div>
                  )}
                </div>

                {/* Like Button Overlay */}
                <div className="absolute top-3 right-3">
                  <button
                    type="button"
                    className="size-8 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="#FF385C"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z" />
                    </svg>
                  </button>
                </div>

                {/* Gradient overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-10 rounded-b-xl bg-gradient-to-t from-neutral-900 opacity-50"></div>
              </div>

              {/* Product Info */}
              <div className="space-y-2.5 px-1 pt-4">
                <div>
                  {product.brand && (
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                      {product.brand}
                    </div>
                  )}
                  <div className="mt-1.5 flex items-center gap-x-2">
                    <h3 className="text-base font-medium capitalize line-clamp-1 text-neutral-900 dark:text-white">
                      {product.name}
                    </h3>
                  </div>
                </div>

                <div className="w-14 border-b border-neutral-100 dark:border-neutral-800"></div>

                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-base font-semibold text-neutral-900 dark:text-white">
                      {formatPrice(product.price)} ₽
                    </span>
                  </div>
                  <div className="flex items-center gap-x-1 text-sm">
                    {product.avg_rating > 0 && (
                      <>
                        <div className="pb-0.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="text-orange-400 size-4"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="font-medium">{Number(product.avg_rating).toFixed(1)}</span>
                        {product.reviews_count > 0 && (
                          <span className="text-neutral-500 dark:text-neutral-400">
                            ({product.reviews_count})
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Stock status */}
                <div className="text-xs">
                  {product.in_stock ? (
                    <span className="text-green-600 font-medium">В наличии</span>
                  ) : (
                    <span className="text-red-500 font-medium">Нет в наличии</span>
                  )}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* View All Link */}
      <div className="mt-16 flex justify-center">
        <Link
          href={`/catalog/categories/${category.slug}`}
          className="relative isolate inline-flex shrink-0 items-center justify-center gap-x-2.5 rounded-full border px-[calc(var(--spacing-4)-1px)] py-[calc(var(--spacing-2.5)-1px)] sm:px-[calc(var(--spacing-5)-1px)] sm:text-sm/6 focus:not-data-focus:outline-hidden data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-blue-500 data-disabled:opacity-50 *:data-[slot=icon]:-mx-0.5 *:data-[slot=icon]:my-0.5 *:data-[slot=icon]:size-5 *:data-[slot=icon]:shrink-0 *:data-[slot=icon]:self-center sm:*:data-[slot=icon]:my-1 sm:*:data-[slot=icon]:size-4 forced-colors:[--btn-icon:ButtonText] forced-colors:data-hover:[--btn-icon:ButtonText] border-transparent bg-(--btn-border) dark:bg-(--btn-bg) before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-(--btn-bg) dark:before:hidden dark:border-white/5 after:absolute after:inset-0 after:-z-10 after:rounded-full data-active:after:bg-(--btn-hover-overlay) data-hover:after:bg-(--btn-hover-overlay) dark:after:-inset-px dark:after:rounded-full data-disabled:before:shadow-none data-disabled:after:shadow-none text-white [--btn-bg:var(--color-neutral-900)] [--btn-border:var(--color-neutral-950)]/90 [--btn-hover-overlay:var(--color-white)]/10 dark:text-neutral-950 dark:[--btn-bg:white] dark:[--btn-hover-overlay:var(--color-neutral-950)]/5 [--btn-icon:var(--color-neutral-400)] data-active:[--btn-icon:var(--color-neutral-300)] data-hover:[--btn-icon:var(--color-neutral-300)] dark:[--btn-icon:var(--color-neutral-500)] dark:data-active:[--btn-icon:var(--color-neutral-400)] dark:data-hover:[--btn-icon:var(--color-neutral-400)] hover:bg-neutral-800 dark:hover:bg-white dark:hover:text-neutral-900 transition-colors"
        >
          <span>Все {category.name}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            className="rtl:rotate-180"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path d="M18.5 12L4.99997 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d="M13 18C13 18 19 13.5811 19 12C19 10.4188 13 6 13 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </Link>
      </div>
    </div>
  );
}