import Layout from '../../components/Layout';
import Link from 'next/link';
import { blogAPI } from '../../lib/api';
import { Calendar, Eye, ArrowLeft, BookOpen, ChevronRight, Home } from 'lucide-react';

export default function BlogPostPage({ post, error }) {
  const siteUrl = 'https://lemanas.ru';

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.meta_title || post.title,
    "description": post.meta_description || post.excerpt,
    "datePublished": post.created_at,
    "dateModified": post.updated_at,
    "publisher": {
      "@type": "Organization",
      "name": "Рейтинг магазинов Лемана Про",
      "url": siteUrl,
    },
  };

  if (error || !post) {
    return (
      <Layout title="Статья не найдена" description="Запрашиваемая статья не найдена" canonical={siteUrl}>
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-3">Статья не найдена</h1>
          <p className="text-gray-500 mb-6">
            К сожалению, запрашиваемая статья не найдена или была удалена.
          </p>
          <Link href="/blog" className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
            <ArrowLeft className="w-5 h-5" />
            В блог
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={post.meta_title || post.title}
      description={post.meta_description || post.excerpt}
      canonical={`${siteUrl}/blog/${post.slug}`}
      schema={articleSchema}
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
            <Link href="/blog" className="hover:text-gray-700">
              Блог
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium truncate">{post.title.slice(0, 40)}...</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Category */}
        {post.category && (
          <span className="inline-block bg-primary-100 text-primary-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            {post.category.name}
          </span>
        )}

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-black mb-4">{post.title}</h1>

        {/* Meta */}
        <div className="flex items-center gap-4 text-gray-500 text-sm mb-6">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {new Date(post.created_at).toLocaleDateString('ru-RU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            {post.views_count?.toLocaleString('ru')} просмотров
          </span>
        </div>

        {/* Image */}
        {post.image && (
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL}${post.image}`}
            alt={post.title}
            className="w-full h-64 sm:h-96 object-cover rounded-xl mb-8"
          />
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none leading-relaxed text-gray-700"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Bottom CTA */}
        <hr className="my-8 border-gray-200" />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link href="/blog" className="inline-flex items-center gap-2 border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-colors">
            <ArrowLeft className="w-5 h-5" />
            К списку статей
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-bold transition-colors">
            Смотреть рейтинг 🏆
          </Link>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const res = await blogAPI.getPost(params.slug);
    return { props: { post: res.data } };
  } catch (err) {
    if (err.response?.status === 404) {
      return { notFound: true };
    }
    return { props: { post: null, error: true } };
  }
}
