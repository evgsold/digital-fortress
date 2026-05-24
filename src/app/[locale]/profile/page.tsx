"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation" 
import { CheckCircle, XCircle, AlertCircle, LogOut, Loader2 } from "lucide-react"
import { motion, AnimatePresence, easeOut } from "framer-motion"
import { forumPostOperations } from '@/lib/firebase/database'
import type { ForumPost } from '@/types/database'
import { useUser } from "@/contexts/UserContext"

type FormErrors = {
  displayName?: string;
  general?: string;
};

// Анимационные варианты
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } }
};

const notificationVariants = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

export default function ProfilePage() {
  const router = useRouter()
  const { currentUser, loading: userLoading, updateProfile, logout } = useUser()
  
  const [displayName, setDisplayName] = useState("")
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [errors, setErrors] = useState<FormErrors>({});
  const [myPosts, setMyPosts] = useState<ForumPost[]>([])
  const [loadingPosts, setLoadingPosts] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!currentUser) return
      setErrors({});
      try {
        setLoadingPosts(true)
        const postsByUserId = currentUser.userId ? await forumPostOperations.getByAuthor(currentUser.userId, 100) : []
        let merged = postsByUserId
        if ((!merged || merged.length === 0) && currentUser.id && currentUser.id !== currentUser.userId) {
          const postsById = await forumPostOperations.getByAuthor(currentUser.id, 100)
          const map = new Map<string, ForumPost>()
          for (const p of [...merged, ...postsById]) map.set(p.id, p)
          merged = Array.from(map.values())
        }
        setMyPosts(merged)
      } catch (e) {
        console.error('Не удалось загрузить посты пользователя', e)
      } finally {
        setLoadingPosts(false)
      }
    }
    if (!userLoading) load()
  }, [currentUser, userLoading])


  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || "")
    }
  }, [currentUser])

  const validateProfile = (): boolean => {
    const newErrors: FormErrors = {};
    if (!displayName.trim()) {
      newErrors.displayName = "Имя не может быть пустым";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const markPostResolved = async (postId: string) => {
    try {
      setMyPosts(prev => prev.map(p => p.id === postId ? { ...p, isResolved: true, updatedAt: new Date().toISOString(), lastActivityAt: new Date().toISOString() } : p))
      await forumPostOperations.update(postId, { isResolved: true, updatedAt: new Date().toISOString(), lastActivityAt: new Date().toISOString() } as Partial<ForumPost>)
      setMsg('Пост отмечен как решенный')
    } catch (e) {
      console.error('Не удалось отметить пост как решенный', e)
      setErrors({ general: 'Не удалось отметить пост как решенный' })
      const fresh = currentUser ? await forumPostOperations.getByAuthor(currentUser.userId, 100) : []
      setMyPosts(fresh)
    }
  }

  const handleSaveProfile = async () => {
    if (!currentUser || !validateProfile()) return
    
    setSaving(true); setMsg(null); setErrors({})
    try {
      if (displayName.trim() !== currentUser.displayName) {
        await updateProfile(displayName.trim())
      }
      setMsg("Профиль успешно обновлен")
    } catch (e: any) {
      console.error("Ошибка обновления профиля:", e)
      setErrors({ general: e?.message || "Не удалось обновить профиль. Попробуйте еще раз." })
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error("Не удалось выйти:", error);
      setErrors({ general: "Не удалось выйти из аккаунта. Попробуйте еще раз." });
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center text-[#718096] font-mono">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#4299E1]" />
          Загрузка...
        </div>
      </div>
    )
  }
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border-2 border-[#E2E8F0] p-8 text-center max-w-md w-full rounded-xl shadow-lg"
        >
          <div className="text-lg font-semibold mb-2 text-[#2D3748] font-mono">Требуется вход в систему</div>
          <p className="text-[#718096] mb-4 font-mono">Пожалуйста, войдите или зарегистрируйтесь, чтобы просмотреть свой профиль.</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/login" className="px-4 py-2 border border-[#CBD5E0] text-[#2D3748] hover:bg-[#F7FAFC] font-mono rounded-lg transition-colors">Войти</Link>
            <Link href="/register" className="px-4 py-2 bg-[#4299E1] text-white hover:bg-[#3182CE] font-mono font-bold rounded-lg transition-colors">Регистрация</Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC] text-[#718096]">
      <motion.div 
        className="max-w-4xl mx-auto p-3 sm:p-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#2D3748] font-mono">Мой профиль</h1>
          <div className="text-sm sm:text-base mt-1 font-mono">{currentUser.displayName} • {currentUser.email}</div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white border-2 border-[#E2E8F0] mb-4 sm:mb-6 rounded-xl shadow-sm">
          <div className="p-3 sm:p-4 border-b border-[#E2E8F0]">
            <h2 className="text-base sm:text-lg font-bold text-[#2D3748] font-mono">Настройки профиля</h2>
          </div>
          <div className="p-3 sm:p-4 space-y-4">
            <AnimatePresence>
              {msg && (
                <motion.div {...notificationVariants} className="flex items-center gap-2 text-[#4299E1] bg-[#4299E1]/10 border border-[#4299E1]/30 px-3 py-2 text-sm rounded-md">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-mono">{msg}</span>
                </motion.div>
              )}
              {errors.general && (
                <motion.div {...notificationVariants} className="flex items-center gap-2 text-red-500 bg-red-50 border border-red-200 px-3 py-2 text-sm rounded-md">
                  <XCircle className="w-4 h-4" />
                  <span className="font-mono">{errors.general}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-[#2D3748] mb-2 font-mono">Отображаемое имя</label>
              <input 
                id="displayName"
                value={displayName} 
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (errors.displayName) {
                    const newErrors = { ...errors };
                    delete newErrors.displayName;
                    setErrors(newErrors);
                  }
                }} 
                className={`w-full px-3 py-3 bg-[#F7FAFC] text-[#2D3748] border-2 focus:outline-none text-base font-mono rounded-lg placeholder-[#718096]/50 ${errors.displayName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#E2E8F0] focus:border-[#4299E1] focus:ring-1 focus:ring-[#4299E1]'}`}
              />
              {errors.displayName && (
                <div className="flex items-center gap-1 text-red-500 mt-2 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-mono">{errors.displayName}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-500 hover:bg-red-100 font-medium transition-colors font-mono border border-red-200 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                <span>выйти из аккаунта</span>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                disabled={saving} 
                onClick={handleSaveProfile} 
                className="px-4 py-3 bg-[#4299E1] text-white hover:bg-[#3182CE] font-bold disabled:bg-[#CBD5E0] disabled:text-[#718096] disabled:cursor-not-allowed font-mono border-2 border-[#4299E1] rounded-lg"
              >
                {saving ? 'Сохранение...' : 'Сохранить профиль'}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Мои посты на форуме */}
        <motion.div variants={itemVariants} className="bg-white border-2 border-[#E2E8F0] mb-4 sm:mb-6 rounded-xl shadow-sm">
          <div className="p-3 sm:p-4 border-b border-[#E2E8F0]">
            <h2 className="text-base sm:text-lg font-bold text-[#2D3748] font-mono">Мои посты на форуме</h2>
          </div>
          <div className="p-3 sm:p-4">
            {loadingPosts ? (
              <div className="text-sm text-[#718096] font-mono">Загрузка...</div>
            ) : myPosts.length === 0 ? (
              <div className="text-sm text-[#718096] font-mono">У вас пока нет постов</div>
            ) : (
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
                {myPosts.map(post => (
                  <motion.div variants={itemVariants} key={post.id} className="border border-[#E2E8F0] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg">
                    <div>
                      <Link href={`/forum/${post.id}`} className="font-mono font-bold hover:text-[#4299E1] text-[#2D3748] transition-colors">{post.title}</Link>
                      <div className="text-xs text-[#718096]/70 font-mono mt-1">
                        {new Date(post.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {post.isResolved ? (
                        <span className="px-2 py-1 text-xs bg-[#4299E1]/10 text-[#4299E1] font-mono border-transparent rounded-md">Решено</span>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => markPostResolved(post.id)}
                          className="px-3 py-2 text-xs sm:text-sm bg-[#4299E1] text-white hover:bg-[#3182CE] font-mono font-bold rounded-lg transition-colors"
                        >
                          Отметить как решено
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}