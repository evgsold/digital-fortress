"use client"

import { motion } from "framer-motion"
import { Calendar, Clock, Share2, ArrowLeft, Tag, Copy, Check, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import { useState, useEffect, useMemo, useRef } from "react"
import copy from "copy-to-clipboard"
import {
  FacebookShareButton, TwitterShareButton, LinkedinShareButton, TelegramShareButton, WhatsappShareButton,
  FacebookIcon, TwitterIcon, LinkedinIcon, TelegramIcon, WhatsappIcon,
} from "react-share"

import { useBlogAdmin as useBlog } from "@/contexts/BlogAdminContext"
import type { BlogPost, BlogCategory } from "@/types/database"
import BlogContent from "../BlogContent"

const LoadingState = () => (
  <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center text-[#718096]">
    <div className="text-center font-mono">
      <Loader2 className="w-12 h-12 mx-auto animate-spin text-[#4299E1]" />
      <p className="mt-4 text-lg">Загрузка статьи...</p>
    </div>
  </div>
);

const NotFoundState = ({ locale }: { locale: string }) => (
  <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center text-[#718096]">
    <div className="text-center font-mono">
      <h1 className="text-2xl font-bold mb-4 text-[#2D3748]">404 - Статья не найдена</h1>
      <p className="mb-6">Запрашиваемая статья не существует или была перемещена.</p>
      <Link href={`/${locale}/blog`} className="inline-flex items-center gap-2 px-4 py-2 bg-[#4299E1] text-white font-bold rounded-lg hover:bg-[#3182CE] transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Вернуться к блогу
      </Link>
    </div>
  </div>
);

export default function BlogPostPage() {
  const params = useParams()
  const locale = params.locale as string
  const idParam = params.id as string

  const { posts, categories, loading, loadAll } = useBlog();

  const [currentUrl, setCurrentUrl] = useState("")
  const [isCopied, setIsCopied] = useState(false)
  const initialized = useRef(false)


  useEffect(() => {
    if (!initialized.current && posts.length === 0 && !loading) {
      initialized.current = true;
      loadAll();
    }
  }, [loadAll, posts.length, loading]);

  const post = useMemo(() => {
    if (!idParam || !posts.length) return null;
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
      .slice(0, 3);
  }, [post, posts]);

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

  if (loading) {
    return <LoadingState />;
  }

  if (!post) {
    return <NotFoundState locale={locale} />;
  }


  return (
    <div className="min-h-screen bg-[#F7FAFC] text-[#718096] font-mono">
      {/* Header */}
      <div className="bg-white border-b-2 border-[#E2E8F0]">
        <div className="container mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Link href={`/${locale}/blog`} className="inline-flex items-center gap-2 mb-6 text-[#718096] hover:text-[#4299E1] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Назад к блогу
            </Link>
            <div className="text-center">
              <span className="px-3 py-1 bg-[#4299E1]/10 text-[#4299E1] text-sm font-bold mb-4 inline-block rounded-md">{category?.name}</span>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 text-[#2D3748]">{post?.title}</h1>
              <div className="flex items-center justify-center gap-6 text-[#718096] text-sm">
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
          <div className="relative h-96 border-2 border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
            <Image src={post?.image || "/placeholder.svg"} alt={post?.title || "not found"} fill className="object-cover" />
          </div>
        </motion.div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <motion.div className="lg:col-span-3 bg-white border-2 border-[#E2E8F0] p-8 rounded-xl shadow-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
              <BlogContent content={post?.content as any[]} />
              <div className="mt-8 pt-6 border-t-2 border-[#E2E8F0]">
                <h3 className="text-lg font-bold mb-4 text-[#2D3748]">Теги:</h3>
                <div className="flex flex-wrap gap-2">
                  {post?.tags.map((tag) => (<span key={tag} className="px-2 py-1 bg-[#4299E1]/10 text-[#4299E1] text-xs font-bold flex items-center gap-1 rounded-md"><Tag className="w-3 h-3" />{tag}</span>))}
                </div>
              </div>
            </motion.div>
            <motion.div className="lg:col-span-1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }}>
              <div className="sticky top-24 space-y-8">
                <div className="bg-white border-2 border-[#E2E8F0] p-6 rounded-xl shadow-sm">
                  <h4 className="font-bold mb-4 text-[#2D3748]">Поделиться</h4>
                  <div className="flex flex-wrap gap-2">
                    <FacebookShareButton url={currentUrl} title={post?.title}><FacebookIcon size={32} round /></FacebookShareButton>
                    <TwitterShareButton url={currentUrl} title={post?.title}><TwitterIcon size={32} round /></TwitterShareButton>
                    <LinkedinShareButton url={currentUrl} title={post?.title}><LinkedinIcon size={32} round /></LinkedinShareButton>
                    <TelegramShareButton url={currentUrl} title={post?.title}><TelegramIcon size={32} round /></TelegramShareButton>
                    <WhatsappShareButton url={currentUrl} title={post?.title} separator=":: "><WhatsappIcon size={32} round /></WhatsappShareButton>
                    <button onClick={handleCopy} className="w-8 h-8 bg-[#E2E8F0] flex items-center justify-center rounded-full hover:bg-[#CBD5E0] transition-colors" title="Скопировать ссылку">
                      {isCopied ? <Check className="w-5 h-5 text-[#4299E1]" /> : <Copy className="w-5 h-5 text-[#718096]" />}
                    </button>
                  </div>
                </div>
                {relatedPosts.length > 0 && (
                  <div className="bg-white border-2 border-[#E2E8F0] p-6 rounded-xl shadow-sm">
                    <h4 className="font-bold mb-4 text-[#2D3748]">Похожие статьи</h4>
                    <div className="space-y-4">
                      {relatedPosts.map((relatedPost) => (
                        <Link key={relatedPost.id} href={`/${locale}/blog/${relatedPost.slug}`} className="block group">
                          <div className="flex gap-3">
                            <div className="relative w-16 h-16 border-2 border-[#E2E8F0] rounded-md flex-shrink-0 overflow-hidden">
                              <Image src={relatedPost.image || "/placeholder.svg"} alt={relatedPost.title} fill className="object-cover" />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-bold text-[#2D3748] group-hover:text-[#4299E1] transition-colors line-clamp-3">{relatedPost.title}</h5>
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