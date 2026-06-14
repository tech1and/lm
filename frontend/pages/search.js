import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import CatalogProductList from '../components/CatalogProductList';
import Link from 'next/link';
import { ChevronRight, Home, Search } from 'lucide-react';
import { catalogAPI } from '../lib/api';

export default function SearchPage({ initialData, query }) {
    const router = useRouter();
    const [searchInput, setSearchInput] = useState(query || '');

    // Синхронизируем input при смене query в URL
    useEffect(() => {
        if (query) {
            setSearchInput(query);
        }
    }, [query]);

    const handleSearch = (e) => {
        e.preventDefault();
        const q = searchInput.trim();
        if (q && q !== query) {
            router.push(`/search?q=${encodeURIComponent(q)}`);
        }
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Главная", "item": process.env.NEXT_PUBLIC_SITE_URL },
            { "@type": "ListItem", "position": 2, "name": "Поиск", "item": `${process.env.NEXT_PUBLIC_SITE_URL}/search` },
        ],
    };

    return (
        <Layout
            title={query ? `Поиск: ${query}` : 'Поиск товаров'}
            description={query ? `Результаты поиска товаров по запросу "${query}"` : 'Поиск товаров Лемана Про'}
            canonical={`${process.env.NEXT_PUBLIC_SITE_URL}/search${query ? `?q=${encodeURIComponent(query)}` : ''}`}
            schema={breadcrumbSchema}
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
                        <span className="text-gray-900 font-medium">Поиск</span>
                        {query && (
                            <>
                                <ChevronRight className="w-4 h-4" />
                                <span className="text-gray-500 truncate max-w-[200px]">&laquo;{query}&raquo;</span>
                            </>
                        )}
                    </nav>
                </div>
            </div>

            {/* Main */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <span className="inline-block bg-primary-500 text-dark-800 px-4 py-1.5 rounded-full font-bold text-sm mb-4">
                        🔍 Поиск
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-black mb-3 flex items-center gap-3">
                        <Search className="w-8 h-8 text-primary-500" />
                        Поиск товаров
                    </h1>
                    <p className="text-gray-500 text-lg mb-6">
                        Найдите нужный товар по названию, бренду или описанию.
                    </p>

                    {/* Search form on page */}
                    <form onSubmit={handleSearch} className="max-w-2xl">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Введите название товара, бренд или артикул..."
                                className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all shadow-sm"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-500 hover:bg-primary-600 text-dark-800 font-bold px-5 py-2 rounded-lg transition-colors text-sm"
                            >
                                Найти
                            </button>
                        </div>
                    </form>
                </div>

                {/* Results */}
                {query ? (
                    <CatalogProductList
                        searchQuery={query}
                        initialData={initialData}
                    />
                ) : (
                    <div className="text-center py-16 text-gray-500">
                        <Search className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                        <p className="text-xl font-semibold mb-2">Введите запрос для поиска</p>
                        <p className="text-gray-400">
                            Например: &laquo;дрель&raquo;, &laquo;краска&raquo;, &laquo;саморезы&raquo;
                        </p>
                    </div>
                )}
            </div>
        </Layout>
    );
}

export async function getServerSideProps(context) {
    const query = context.query.q || '';

    if (!query) {
        return {
            props: {
                query: '',
                initialData: { products: [], children: [], category: null },
            },
        };
    }

    try {
        const res = await catalogAPI.search(query, {
            page: 1,
            page_size: 20,
            ordering: '-avg_rating',
        });

        const products = res.data.results || [];
        const totalCount = res.data.count || products.length;

        return {
            props: {
                query,
                initialData: {
                    products,
                    children: [],
                    category: { name: `Поиск: ${query}`, slug: 'search' },
                    totalCount,
                },
            },
        };
    } catch (err) {
        console.error('SSR Search Error:', err.message);
        return {
            props: {
                query,
                initialData: {
                    products: [],
                    children: [],
                    category: { name: `Поиск: ${query}`, slug: 'search' },
                    totalCount: 0,
                },
            },
        };
    }
}