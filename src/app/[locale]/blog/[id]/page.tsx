"use client"

import { motion } from "framer-motion"
import { Calendar, Clock, Share2, ArrowLeft, Tag, Copy, Check, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import { useState, useEffect, useMemo } from "react"
import copy from "copy-to-clipboard"
import {
  FacebookShareButton, TwitterShareButton, LinkedinShareButton, TelegramShareButton, WhatsappShareButton,
  FacebookIcon, TwitterIcon, LinkedinIcon, TelegramIcon, WhatsappIcon,
} from "react-share"

// 1. Импортируем хук из вашего контекста и типы
import { useBlogAdmin as useBlog } from "@/contexts/BlogAdminContext"
import type { BlogPost, BlogCategory } from "@/types/database"
import BlogContent from "../BlogContent" // Предполагается, что этот компонент у вас есть

// Компонент для состояния загрузки
const LoadingState = () => (
  <div className="min-h-screen bg-black flex items-center justify-center text-white">
    <div className="text-center font-mono">
      <Loader2 className="w-12 h-12 mx-auto animate-spin" />
      <p className="mt-4 text-lg">Загрузка статьи...</p>
    </div>
  </div>
);

// Компонент для состояния "Не найдено"
const NotFoundState = ({ locale }: { locale: string }) => (
  <div className="min-h-screen bg-black flex items-center justify-center text-white">
    <div className="text-center font-mono">
      <h1 className="text-2xl font-bold mb-4">404 - Статья не найдена</h1>
      <p className="text-gray-400 mb-6">Запрашиваемая статья не существует или была перемещена.</p>
      <Link href={`/${locale}/blog`} className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black font-bold border-2 border-white hover:bg-gray-200">
        <ArrowLeft className="w-4 h-4" />
        Вернуться к блогу
      </Link>
    </div>
  </div>
);

export default function BlogPostPage() {
  const params = useParams()
  // Используем сегменты маршрута: [locale]/blog/[id]
  const locale = params.locale as string
  const idParam = params.id as string

  // 2. Получаем данные и состояние из контекста
  const { posts, categories, loading, loadAll } = useBlog();

  const [currentUrl, setCurrentUrl] = useState("")
  const [isCopied, setIsCopied] = useState(false)

  // 3. Загружаем данные, если их нет в контексте
  useEffect(() => {
    if (!posts.length && !loading) {
      loadAll();
    }
  }, [loadAll, posts.length, loading]);

  // 4. Мемоизируем поиск данных для оптимизации
  const post = useMemo(() => {
    if (!idParam || !posts.length) return null;
    // Ищем по slug, затем по id как fallback
    return posts.find(p => p.slug === idParam) || posts.find(p => p.id === idParam);
  }, [idParam, posts]);

  const category = useMemo(() => {
    if (!post || !categories.length) return null;
    return categories.find(c => c.id === post.categoryId);
  }, [post, categories]);

  const relatedPosts = useMemo(() => {
    if (!post || !posts.length) return [];
    return posts
      .filter(p => p.categoryId === post.categoryId && p.id !== post.id && p.status === 'published')
      .slice(0, 3); // Берем первые 3 похожие статьи
  }, [post, posts]);

  // Устанавливаем URL для кнопок "Поделиться"
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href)
    }
  }, []);

  const handleCopy = () => {
    copy(currentUrl)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  // 5. Обрабатываем состояния загрузки и "не найдено"
  if (loading && !post) {
    return <LoadingState />;
  }

  if (!loading && !post) {
    return <NotFoundState locale={locale} />;
  }
  
  // Если post есть, но категории еще нет (редкий случай), можно показать заглушку
  if (!category) {
      return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {/* Header */}
      <div className="bg-black border-b-2 border-white">
        <div className="container mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Link href={`/${locale}/blog`} className="inline-flex items-center gap-2 mb-6 hover:underline">
              <ArrowLeft className="w-4 h-4" />
              Назад к блогу
            </Link>
            <div className="text-center">
              <span className="px-3 py-1 bg-white text-black text-sm font-bold mb-4 inline-block">{category.name}</span>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">{post?.title}</h1>
              <div className="flex items-center justify-center gap-6 text-gray-400 text-sm">
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>{new Date(post?.publishedAt || "20.06.2000").toLocaleDateString("ru-RU")}</span></div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>{post?.readTime} мин чтения</span></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Featured Image */}
      <div className="container mx-auto px-4 py-8">
        <motion.div className="max-w-5xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
          <div className="relative h-96 border-2 border-white">
            <Image src={post?.image || "/placeholder.svg"} alt={post?.title || "not found"} fill className="object-cover" />
          </div>
        </motion.div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <motion.div className="lg:col-span-3 bg-white text-black border-2 border-black p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
              <BlogContent content={post?.content as any[]} />
              <div className="mt-8 pt-6 border-t-2 border-gray-200">
                <h3 className="text-lg font-bold mb-4">Теги:</h3>
                <div className="flex flex-wrap gap-2">
                  {post?.tags.map((tag) => (<span key={tag} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1"><Tag className="w-3 h-3" />{tag}</span>))}
                </div>
              </div>
            </motion.div>
            <motion.div className="lg:col-span-1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }}>
              <div className="sticky top-24 space-y-8">
                <div className="bg-white text-black border-2 border-black p-6">
                  <h4 className="font-bold mb-4">Поделиться</h4>
                  <div className="flex flex-wrap gap-2">
                    <FacebookShareButton url={currentUrl} title={post?.title}><FacebookIcon size={32} /></FacebookShareButton>
                    <TwitterShareButton url={currentUrl} title={post?.title}><TwitterIcon size={32} /></TwitterShareButton>
                    <LinkedinShareButton url={currentUrl} title={post?.title}><LinkedinIcon size={32} /></LinkedinShareButton>
                    <TelegramShareButton url={currentUrl} title={post?.title}><TelegramIcon size={32} /></TelegramShareButton>
                    <WhatsappShareButton url={currentUrl} title={post?.title} separator=":: "><WhatsappIcon size={32} /></WhatsappShareButton>
                    <button onClick={handleCopy} className="w-8 h-8 bg-gray-200 flex items-center justify-center border-2 border-black hover:bg-gray-300" title="Скопировать ссылку">
                      {isCopied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                {relatedPosts.length > 0 && (
                  <div className="bg-white text-black border-2 border-black p-6">
                    <h4 className="font-bold mb-4">Похожие статьи</h4>
                    <div className="space-y-4">
                      {relatedPosts.map((relatedPost) => (
                        <Link key={relatedPost.id} href={`/${locale}/blog/${relatedPost.slug}`} className="block group">
                          <div className="flex gap-3">
                            <div className="relative w-16 h-16 border-2 border-black flex-shrink-0">
                              <Image src={relatedPost.image || "/placeholder.svg"} alt={relatedPost.title} fill className="object-cover" />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-bold group-hover:underline line-clamp-3">{relatedPost.title}</h5>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}