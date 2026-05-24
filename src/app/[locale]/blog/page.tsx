"use client"

import { motion } from "framer-motion"
import { Search, Calendar, ArrowRight, Clock, Sparkles, TrendingUp, Star, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"

import Image from "next/image"
import { useBlogAdmin as useBlog } from "@/contexts/BlogAdminContext" 
import type { BlogPost, BlogCategory } from "@/types/database"
import { easeOut } from "framer-motion"
const LoadingState = () => (
  <div className="flex justify-center items-center min-h-screen bg-[#F7FAFC] text-[#718096]">
    <div className="text-center font-mono">
      <Loader2 className="w-12 h-12 mx-auto animate-spin text-[#4299E1]" />
      <p className="mt-4 text-lg">Загрузка статей...</p>
    </div>
  </div>
);

export default function BlogPage() {
  const { posts, categories, loading, error, loadAll } = useBlog();
  const params = useParams();
  const locale = params.locale as string;

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 6

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadAll();
      } catch (err) {
        console.error('Failed to load blog data:', err);
      }
    };

    if (posts.length === 0 && !loading) {
      loadData();
    }
  }, [loadAll, loading, posts.length]);

  const publishedPosts = useMemo(() => posts.filter((p) => p.status === "published"), [posts]);

  const allCategories = useMemo(() => [
    { id: "all", name: "Все статьи", count: publishedPosts.length },
    ...categories.map((cat) => ({
      ...cat,
      count: publishedPosts.filter((p) => p.categoryId === cat.id).length,
    })),
  ], [categories, publishedPosts]);

  const featuredPosts = useMemo(() => publishedPosts.filter(p => p.featured), [publishedPosts]);

  const filteredPosts = useMemo(() => {
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      return publishedPosts.filter(post => 
        post.title.toLowerCase().includes(lowercasedQuery) ||
        post.excerpt.toLowerCase().includes(lowercasedQuery) ||
        post.tags.some(tag => tag.toLowerCase().includes(lowercasedQuery))
      );
    } 
    if (selectedCategory !== "all") {
      return publishedPosts.filter(post => post.categoryId === selectedCategory);
    }
    return publishedPosts;
  }, [publishedPosts, searchQuery, selectedCategory]);

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)
  const startIndex = (currentPage - 1) * postsPerPage
  const currentPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage)

  const getCategoryById = (categoryId: string): BlogCategory | undefined => {
    return categories.find(c => c.id === categoryId);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };
    const itemVariants = {
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
    };

  if (loading && posts.length === 0) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#F7FAFC] text-[#718096]">
        <div className="text-center font-mono p-6 border border-red-200 bg-red-50 rounded-lg">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Ошибка загрузки блога</h2>
          <p className="mb-4 text-red-500">{error}</p>
          <button
            onClick={loadAll}
            className="px-4 py-2 bg-[#4299E1] text-white hover:bg-[#3182CE] rounded-lg font-bold"
            disabled={loading}
          >
            {loading ? 'Загрузка...' : 'Повторить попытку'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC] text-[#718096] font-mono">
      {/* Header */}
      <div className="bg-white border-b-2 border-[#E2E8F0]">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-[#4299E1] rounded-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#2D3748]">Blog</h1>
            </div>
            <p className="text-xl text-[#718096]">Экспертные статьи, инсайды и обзоры из мира кибербезопасности и IT.</p>
          </motion.div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white border-2 border-[#E2E8F0] p-6 sticky top-24 rounded-xl shadow-sm">
              <h2 className="text-lg font-bold mb-4 text-[#2D3748]">Фильтры</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold mb-3 text-[#2D3748]">Поиск</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#718096]" />
                    <input type="text" placeholder="Найти статью..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2 bg-[#F7FAFC] text-[#2D3748] border-2 border-[#E2E8F0] focus:border-[#4299E1] focus:ring-1 focus:ring-[#4299E1] focus:outline-none rounded-lg placeholder-[#718096]/50" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold mb-3 text-[#2D3748]">Категории</h3>
                  <div className="space-y-2">
                    {allCategories.map((category) => (
                      <button key={category.id} onClick={() => { setSelectedCategory(category.id); setCurrentPage(1); setSearchQuery(""); }} className={`w-full text-left px-3 py-2 text-sm border-2 rounded-lg transition-colors ${selectedCategory === category.id ? "bg-[#4299E1] text-white border-[#4299E1] font-bold" : "bg-transparent text-[#718096] border-[#E2E8F0] hover:bg-[#F7FAFC] hover:border-[#4299E1]"}`}>
                        {category.name}
                        <span className="ml-2 text-xs opacity-75">({category.count})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">

            {/* Featured Posts */}
            {selectedCategory === "all" && !searchQuery && featuredPosts.length > 0 && (
              <div className="mb-8">
                <motion.div className="flex items-center gap-3 mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                  <div className="p-2 bg-[#4299E1]/10 border border-[#4299E1]/20 rounded-lg"><TrendingUp className="w-6 h-6 text-[#4299E1]" /></div>
                  <h2 className="text-2xl font-bold text-[#2D3748]">Рекомендуемые статьи</h2>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featuredPosts.slice(0, 3).map((post, index) => {
                    const category = getCategoryById(post.categoryId);
                    return (
                      <motion.article key={post.id} className="group bg-white border-2 border-[#E2E8F0] p-4 rounded-xl hover:border-[#4299E1] transition-colors flex flex-col shadow-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }}>
                        <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                          <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
                          <div className="absolute top-2 left-2"><span className="px-2 py-1 bg-[#4299E1]/10 text-[#4299E1] text-xs font-bold rounded-md">{category?.name}</span></div>
                        </div>
                        <h3 className="text-lg font-bold mb-2 text-[#2D3748] group-hover:text-[#4299E1] transition-colors">{post.title}</h3>
                        <p className="text-[#718096] text-sm mb-4 line-clamp-3 flex-grow">{post.excerpt}</p>
                        <div className="flex items-center justify-between text-xs text-[#718096]/80 mt-auto">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" /><span>{new Date(post.publishedAt).toLocaleDateString("ru-RU")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" /><span>{post.readTime} мин</span>
                          </div>
                        </div>
                        <Link href={`/${locale}/blog/${post.slug}`} className="block mt-4 text-center bg-[#4299E1] text-white py-2 font-bold hover:bg-[#3182CE] rounded-lg transition-colors">Читать</Link>
                      </motion.article>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Blog Posts List */}
            <div className="space-y-4">
              {currentPosts.length > 0 ? (
                currentPosts.map((post) => {
                  const category = getCategoryById(post.categoryId);
                  return (
                    <motion.article key={post.id} className="group bg-white border-2 border-[#E2E8F0] p-4 flex flex-col md:flex-row gap-4 rounded-xl hover:border-[#4299E1] transition-colors shadow-sm" variants={itemVariants}>
                      <div className="md:w-1/3 relative h-48 md:h-auto flex-shrink-0 rounded-lg overflow-hidden">
                        <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
                      </div>
                      <div className="md:w-2/3 flex flex-col">
                        <div className="mb-2">
                          <span className="px-2 py-1 bg-[#4299E1]/10 text-[#4299E1] text-xs font-bold rounded-md">{category?.name}</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-[#2D3748] group-hover:text-[#4299E1] transition-colors">{post.title}</h3>
                        <p className="text-[#718096] text-sm mb-4 line-clamp-3 flex-grow">{post.excerpt}</p>
                        <div className="flex items-center justify-between text-xs text-[#718096]/80 mt-auto">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" /><span>{new Date(post.publishedAt).toLocaleDateString("ru-RU")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" /><span>{post.readTime} мин</span>
                          </div>
                        </div>
                        <Link href={`/${locale}/blog/${post.slug}`} className="block mt-4 text-center bg-[#4299E1] text-white py-2 font-bold hover:bg-[#3182CE] rounded-lg transition-colors">Читать</Link>
                      </div>
                    </motion.article>
                  )
                })
              ) : (
                <div className="bg-white border-2 border-dashed border-[#E2E8F0] p-8 text-center rounded-xl">
                  <h3 className="text-xl font-bold mb-2 text-[#2D3748]">Статьи не найдены</h3>
                  <p className="text-[#718096]">Попробуйте изменить фильтры или поисковый запрос.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div className="flex justify-center items-center gap-2 mt-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
                <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 bg-transparent text-[#718096] border border-[#E2E8F0] hover:bg-[#F7FAFC] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg">Назад</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button key={page} onClick={() => setCurrentPage(page)} className={`px-4 py-2 border rounded-lg ${currentPage === page ? "bg-[#4299E1] text-white border-[#4299E1] font-bold" : "bg-transparent text-[#718096] border-[#E2E8F0] hover:bg-[#F7FAFC]"}`}>{page}</button>
                ))}
                <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 bg-transparent text-[#718096] border border-[#E2E8F0] hover:bg-[#F7FAFC] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg">Вперед</button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}