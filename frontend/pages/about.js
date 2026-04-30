import Layout from '../components/Layout';
import Link from 'next/link';
import { Star, RefreshCw, Search, ShieldCheck, Trophy, Heart, Eye, BarChart3, ArrowRight, MessageSquare, Home, ChevronRight } from 'lucide-react';

export default function AboutPage() {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "О проекте — Рейтинг магазинов Лемана Про",
    "url": `${process.env.NEXT_PUBLIC_SITE_URL}/about`,
    "description": "Узнайте больше о нашем независимом рейтинге магазинов Лемана Про",
  };

  return (
    <Layout
      title="О проекте — Рейтинг магазинов Лемана Про"
      description="Узнайте больше о нашем независимом рейтинге магазинов Лемана Про. Как формируется рейтинг, наша миссия и принципы работы."
      canonical={`${process.env.NEXT_PUBLIC_SITE_URL}/about`}
      schema={aboutSchema}
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
            <span className="text-gray-900 font-medium">О проекте</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12">
          <span className="inline-block bg-primary-500 text-dark-800 px-4 py-1.5 rounded-full font-bold text-sm mb-4">
            ℹ️ О проекте
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mb-3">
            О рейтинге магазинов Лемана Про
          </h1>
          <p className="text-gray-500 text-lg">
            Независимый рейтинг магазинов Лемана Про, основанный на реальных отзывах покупателей
          </p>
        </div>

        {/* Mission */}
        <section className="mb-12">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-lg">🎯</span>
              </span>
              Наша миссия
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              Мы создаём прозрачный и честный рейтинг магазинов Лемана Про,
              помогая покупателям делать обоснованный выбор. Все оценки формируются
              на основе реальных отзывов пользователей и объективных данных.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="mb-12">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </span>
              Как работает рейтинг?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  step: '1',
                  icon: MessageSquare,
                  title: 'Отзывы покупателей',
                  text: 'Пользователи оставляют отзывы о магазинах Лемана Про'
                },
                {
                  step: '2',
                  icon: Heart,
                  title: 'Лайки и оценки',
                  text: 'Ставят лайки понравившимся магазинам'
                },
                {
                  step: '3',
                  icon: Eye,
                  title: 'Просмотры страниц',
                  text: 'Просматривают страницы — это также учитывается'
                },
                {
                  step: '4',
                  icon: Trophy,
                  title: 'Алгоритм рейтинга',
                  text: 'Алгоритм формирует итоговый рейтинг на основе всех данных'
                },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.step} className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-100">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">
                      {item.step}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-5 h-5 text-gray-600" />
                        <strong className="text-gray-900">{item.title}</strong>
                      </div>
                      <p className="text-sm text-gray-500">{item.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mb-12">
          <div className="max-w-4xl">
            <div className="bg-gradient-to-br from-dark-800 to-dark-900 text-white rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-3">Готовы выбрать лучший магазин?</h3>
              <p className="text-gray-300 mb-6">
                Смотрите полный рейтинг магазинов Лемана Про и выбирайте лучший вариант для себя
              </p>
              <Link href="/rating" className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-dark-800 px-8 py-3 rounded-xl font-bold text-lg transition-colors">
                Смотреть рейтинг
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section>
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold mb-6">Почему нам доверяют?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  icon: Star,
                  title: 'Объективность',
                  text: 'Рейтинг основан на реальных данных покупателей, а не на платных размещениях'
                },
                {
                  icon: RefreshCw,
                  title: 'Актуальность',
                  text: 'Рейтинг обновляется ежедневно с учётом новых отзывов и оценок'
                },
                {
                  icon: Search,
                  title: 'Прозрачность',
                  text: 'Мы открыто рассказываем о принципах формирования рейтинга'
                },
                {
                  icon: ShieldCheck,
                  title: 'Модерация',
                  text: 'Все отзывы проходят проверку на достоверность'
                },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-100">
                    <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <strong className="text-gray-900">{item.title}</strong>
                      <p className="text-sm text-gray-500 mt-1">{item.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
