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
  <div className="flex justify-center items-center min-h-screen bg-[#01032C] text-[#91B1C0]">
    <div className="text-center font-mono">
      <Loader2 className="w-12 h-12 mx-auto animate-spin text-[#A1CCB0]" />
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
      <div className="flex justify-center items-center min-h-screen bg-[#01032C] text-[#91B1C0]">
        <div className="text-center font-mono p-6 border border-red-500/30 bg-red-500/10 rounded-lg">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Ошибка загрузки блога</h2>
          <p className="mb-4 text-red-400">{error}</p>
          <button
            onClick={loadAll}
            className="px-4 py-2 bg-[#A1CCB0] text-[#01032C] hover:bg-[#A1CCB0]/80 rounded-lg font-bold"
            disabled={loading}
          >
            {loading ? 'Загрузка...' : 'Повторить попытку'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#01032C] text-[#91B1C0] font-mono">
      {/* Header */}
      <div className="bg-[#01032C] border-b-2 border-[#91B1C0]/20">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 bg-[#A1CCB0] rounded-lg">
                <Sparkles className="w-8 h-8 text-[#01032C]" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#A1CCB0]">Blog</h1>
            </div>
            <p className="text-xl text-[#91B1C0]">Экспертные статьи, инсайды и обзоры из мира кибербезопасности и IT.</p>
          </motion.div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-[#01032C] border-2 border-[#91B1C0]/20 p-6 sticky top-24 rounded-xl">
              <h2 className="text-lg font-bold mb-4 text-[#A1CCB0]">Фильтры</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold mb-3 text-[#A1CCB0]">Поиск</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#91B1C0]" />
                    <input type="text" placeholder="Найти статью..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2 bg-[#91B1C0]/10 text-[#A1CCB0] border-2 border-[#91B1C0]/30 focus:border-[#A1CCB0] focus:ring-1 focus:ring-[#A1CCB0] focus:outline-none rounded-lg placeholder-[#91B1C0]/50" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold mb-3 text-[#A1CCB0]">Категории</h3>
                  <div className="space-y-2">
                    {allCategories.map((category) => (
                      <button key={category.id} onClick={() => { setSelectedCategory(category.id); setCurrentPage(1); setSearchQuery(""); }} className={`w-full text-left px-3 py-2 text-sm border-2 rounded-lg transition-colors ${selectedCategory === category.id ? "bg-[#A1CCB0] text-[#01032C] border-[#A1CCB0] font-bold" : "bg-transparent text-[#91B1C0] border-[#91B1C0]/50 hover:bg-[#91B1C0]/10 hover:border-[#A1CCB0]"}`}>
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
                  <div className="p-2 bg-[#91B1C0]/10 border border-[#91B1C0]/20 rounded-lg"><TrendingUp className="w-6 h-6 text-[#A1CCB0]" /></div>
                  <h2 className="text-2xl font-bold text-[#A1CCB0]">Рекомендуемые статьи</h2>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featuredPosts.slice(0, 3).map((post, index) => {
                    const category = getCategoryById(post.categoryId);
                    return (
                      <motion.article key={post.id} className="group bg-[#01032C] border-2 border-[#91B1C0]/20 p-4 rounded-xl hover:border-[#A1CCB0] transition-colors flex flex-col" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }}>
                        <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                          <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
                          <div className="absolute top-2 left-2"><span className="px-2 py-1 bg-[#91B1C0]/20 text-[#A1CCB0] text-xs font-bold rounded-md">{category?.name}</span></div>
                        </div>
                        <h3 className="text-lg font-bold mb-2 text-[#A1CCB0] group-hover:text-opacity-80 transition-colors">{post.title}</h3>
                        <p className="text-[#91B1C0] text-sm mb-4 line-clamp-3 flex-grow">{post.excerpt}</p>
                        <div className="flex items-center justify-between text-xs text-[#91B1C0]/80 mt-auto">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" /><span>{new Date(post.publishedAt).toLocaleDateString("ru-RU")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" /><span>{post.readTime} мин</span>
                          </div>
                        </div>
                        <Link href={`/${locale}/blog/${post.slug}`} className="block mt-4 text-center bg-[#A1CCB0] text-[#01032C] py-2 font-bold hover:bg-[#A1CCB0]/80 rounded-lg transition-colors">Читать</Link>
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
                    <motion.article key={post.id} className="group bg-[#01032C] border-2 border-[#91B1C0]/20 p-4 flex flex-col md:flex-row gap-4 rounded-xl hover:border-[#A1CCB0] transition-colors" variants={itemVariants}>
                      <div className="md:w-1/3 relative h-48 md:h-auto flex-shrink-0 rounded-lg overflow-hidden">
                        <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
                      </div>
                      <div className="md:w-2/3 flex flex-col">
                        <div className="mb-2">
                          <span className="px-2 py-1 bg-[#91B1C0]/20 text-[#A1CCB0] text-xs font-bold rounded-md">{category?.name}</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-[#A1CCB0] group-hover:text-opacity-80 transition-colors">{post.title}</h3>
                        <p className="text-[#91B1C0] text-sm mb-4 line-clamp-3 flex-grow">{post.excerpt}</p>
                        <div className="flex items-center justify-between text-xs text-[#91B1C0]/80 mt-auto">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" /><span>{new Date(post.publishedAt).toLocaleDateString("ru-RU")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" /><span>{post.readTime} мин</span>
                          </div>
                        </div>
                        <Link href={`/${locale}/blog/${post.slug}`} className="block mt-4 text-center bg-[#A1CCB0] text-[#01032C] py-2 font-bold hover:bg-[#A1CCB0]/80 rounded-lg transition-colors">Читать</Link>
                      </div>
                    </motion.article>
                  )
                })
              ) : (
                <div className="bg-[#01032C] border-2 border-dashed border-[#91B1C0]/30 p-8 text-center rounded-xl">
                  <h3 className="text-xl font-bold mb-2 text-[#A1CCB0]">Статьи не найдены</h3>
                  <p className="text-[#91B1C0]">Попробуйте изменить фильтры или поисковый запрос.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div className="flex justify-center items-center gap-2 mt-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
                <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 bg-transparent text-[#91B1C0] border border-[#91B1C0]/50 hover:bg-[#91B1C0]/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg">Назад</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button key={page} onClick={() => setCurrentPage(page)} className={`px-4 py-2 border rounded-lg ${currentPage === page ? "bg-[#A1CCB0] text-[#01032C] border-[#A1CCB0] font-bold" : "bg-transparent text-[#91B1C0] border-[#91B1C0]/50 hover:bg-[#91B1C0]/10"}`}>{page}</button>
                ))}
                <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 bg-transparent text-[#91B1C0] border border-[#91B1C0]/50 hover:bg-[#91B1C0]/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg">Вперед</button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}