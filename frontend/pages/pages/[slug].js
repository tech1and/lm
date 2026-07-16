import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { pagesAPI } from '../../lib/api';

export default function PageDetail({ page, error }) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-gray-500">Загрузка страницы...</div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Страница не найдена</h1>
        <p className="text-gray-600 mb-6">Возможно, она была удалена или не опубликована.</p>
        <Link href="/" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          На главную
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{page.metatitle || page.title}</title>
        <meta name="description" content={page.metadescription || page.shortdescription} />
      </Head>
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-12">
          {page.image && (
            <img 
              src={page.image} 
              alt={page.title} 
              className="w-full h-auto max-h-96 object-cover rounded-xl mb-8" 
            />
          )}
          
          <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-gray-900 tracking-tight">
            {page.title}
          </h1>
          
          {page.shortdescription && (
            <p className="text-lg text-gray-600 mb-8 italic border-l-4 border-blue-500 pl-4 bg-gray-50 py-3 pr-4 rounded-r">
              {page.shortdescription}
            </p>
          )}
          
          {/* 
            Для красивого отображения HTML из CKEditor установите плагин:
            npm install @tailwindcss/typography
            И добавьте его в tailwind.config.js в раздел plugins: require('@tailwindcss/typography')
          */}
          <div 
            className="prose prose-lg max-w-none text-gray-800 prose-a:text-blue-600 prose-headings:text-gray-900 prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: page.description }} 
          />
          
          <div className="mt-12 pt-6 border-t border-gray-100 text-sm text-gray-400">
            Последнее обновление: {new Date(page.updated_at).toLocaleDateString('ru-RU')}
          </div>
        </article>
      </div>
    </>
  );
}

// 1. Генерируем пути для всех активных страниц во время сборки
export async function getStaticPaths() {
  try {
    const res = await pagesAPI.getPages();
    const paths = res.data.map((page) => ({
      params: { slug: page.slug },
    }));

    return {
      paths,
      fallback: true, // Позволяет создавать новые страницы без пересборки всего сайта
    };
  } catch (error) {
    console.error('Ошибка при генерации путей страниц:', error);
    return { paths: [], fallback: true };
  }
}

// 2. Получаем данные для конкретной страницы
export async function getStaticProps({ params }) {
  try {
    const res = await pagesAPI.getPage(params.slug);
    return {
      props: {
        page: res.data || null,
      },
      revalidate: 60, // ISR: обновлять кэш в фоне не чаще чем раз в 60 секунд
    };
  } catch (err) {
    if (err.response?.status === 404) {
      return {
        props: { page: null, error: 'not_found' },
        revalidate: 60,
      };
    }
    return {
      props: { page: null, error: err.message },
      revalidate: 60,
    };
  }
}