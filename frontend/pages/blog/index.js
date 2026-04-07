import Layout from '../../components/Layout';
import Logo from '../../components/Logo';
import Link from 'next/link';
import { blogAPI } from '../../lib/api';
import { BookOpen, Calendar, ArrowRight, Inbox } from 'lucide-react';

export default function BlogPage({ posts, categories }) {
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Блог — Рейтинг магазинов Лемана Про",
    "url": "https://lemanas.ru/blog",
    "description": "Полезные статьи, советы и актуальные рейтинги магазинов Лемана Про",
  };

  return (
    <Layout
      title="Блог — Рейтинг магазинов Лемана Про"
      description="Полезные статьи, советы и актуальные рейтинги магазинов Лемана Про. Читайте о выборе товаров, ремонте и обустройстве дома."
      canonical="https://lemanas.ru/blog"
      schema={blogSchema}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <span className="inline-block bg-primary-500 text-dark-800 px-4 py-1.5 rounded-full font-bold text-sm mb-4">
            📰 Блог
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mb-3">
            Блог о магазинах Лемана Про
          </h1>
          <p className="text-gray-500 text-lg">
            Полезные статьи, советы и актуальные рейтинги для покупателей
          </p>
        </div>

        {/* Categories */}
        {categories && categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="font-semibold text-gray-500">Категории:</span>
            {categories.map(cat => (
              <span key={cat.id} className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                {cat.name}
              </span>
            ))}
          </div>
        )}

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <div key={post.id} className="lm-card overflow-hidden blog-card">
              {post.image ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}${post.image}`}
                  alt={post.title}
                  className="w-full h-52 object-cover"
                />
              ) : (
                <div className="w-full h-52 bg-gray-100 flex items-center justify-center">
                  <Logo size={64} />
                </div>
              )}
              <div className="p-5">
                {post.category && (
                  <span className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold mb-2">
                    {post.category.name}
                  </span>
                )}
                <h2 className="text-lg font-bold mb-2">
                  <Link href={`/blog/${post.slug}`} className="text-gray-900 hover:text-blue-600">
                    {post.title}
                  </Link>
                </h2>
                <p className="text-gray-500 text-sm mb-4">
                  {post.excerpt?.slice(0, 120)}...
                </p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {new Date(post.created_at).toLocaleDateString('ru-RU')}
                  </span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    Читать
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <Inbox className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>Статей пока нет</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  try {
    const [postsRes, categoriesRes] = await Promise.all([
      blogAPI.getPosts(),
      blogAPI.getCategories(),
    ]);
    return {
      props: {
        posts: postsRes.data.results || postsRes.data,
        categories: categoriesRes.data.results || categoriesRes.data,
      },
    };
  } catch (err) {
    return {
      props: { posts: [], categories: [] },
    };
  }
}
