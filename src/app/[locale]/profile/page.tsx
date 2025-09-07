"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
// ИЗМЕНЕНИЕ: Импортируем useRouter
import { useRouter } from "next/navigation" 
// ИЗМЕНЕНИЕ: Импортируем иконку LogOut
import { Shield, CheckCircle, XCircle, User, AlertCircle, LogOut } from "lucide-react"
import { forumPostOperations } from '@/lib/firebase/database'
import type { ForumPost } from '@/types/database'
import { useUser } from "@/contexts/UserContext"
import { useTranslations } from "next-intl"

type AnySalon = { id: string; name: string; address?: string }
type AnyService = { id: string; salonId: string; name: string; durationMinutes: number }

type FormErrors = {
  displayName?: string;
  general?: string;
};

export default function ProfilePage() {
  const t = useTranslations('profilePage')
  const router = useRouter() // ИЗМЕНЕНИЕ: Инициализируем роутер
  // ИЗМЕНЕНИЕ: Получаем функцию logout из контекста
  const { currentUser, loading: userLoading, updateProfile, logout } = useUser()
  
  // ... состояния остаются без изменений ...
  const [loading, setLoading] = useState(true)
  const [displayName, setDisplayName] = useState("")
  const [language, setLanguage] = useState("en")
  const [notifications, setNotifications] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [errors, setErrors] = useState<FormErrors>({});
  const [myPosts, setMyPosts] = useState<ForumPost[]>([])
  const [loadingPosts, setLoadingPosts] = useState(false)

  // ... useEffect и другие функции остаются без изменений ...
  useEffect(() => {
    const load = async () => {
      if (!currentUser) return
      setLoading(true)
      setErrors({});
      // Load user's forum posts
      try {
        setLoadingPosts(true)
        const postsByUserId = currentUser.userId ? await forumPostOperations.getByAuthor(currentUser.userId, 100) : []
        let merged = postsByUserId
        // Legacy: some posts may have been created with authorId = currentUser.id
        if ((!merged || merged.length === 0) && currentUser.id && currentUser.id !== currentUser.userId) {
          const postsById = await forumPostOperations.getByAuthor(currentUser.id, 100)
          // merge unique by post id
          const map = new Map<string, ForumPost>()
          for (const p of [...merged, ...postsById]) map.set(p.id, p)
          merged = Array.from(map.values())
        }
        setMyPosts(merged)
      } catch (e) {
        console.error('Failed to load user posts', e)
      } finally {
        setLoadingPosts(false)
      }
    }
    if (!userLoading) load()
  }, [currentUser, userLoading])


  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || "")
      setLanguage(currentUser.settings?.language || "en")
      setNotifications(Boolean(currentUser.settings?.notifications))
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
      // optimistic update
      setMyPosts(prev => prev.map(p => p.id === postId ? { ...p, isResolved: true, updatedAt: new Date().toISOString(), lastActivityAt: new Date().toISOString() } : p))
      await forumPostOperations.update(postId, { isResolved: true, updatedAt: new Date().toISOString(), lastActivityAt: new Date().toISOString() } as Partial<ForumPost>)
      setMsg('Пост отмечен как решенный')
    } catch (e) {
      console.error('Failed to mark resolved', e)
      setErrors({ general: 'Не удалось отметить пост как решенный' })
      // revert on error
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
      console.error("Profile update error:", e)
      setErrors({ general: e?.message || "Не удалось обновить профиль. Попробуйте еще раз." })
    } finally {
      setSaving(false)
    }
  }



  // ИЗМЕНЕНИЕ: Новая функция для обработки выхода из аккаунта
  const handleLogout = async () => {
    try {
      await logout();
      // Перенаправляем на главную страницу после успешного выхода
      router.push('/');
    } catch (error) {
      console.error("Failed to log out:", error);
      setErrors({ general: "Не удалось выйти из аккаунта. Попробуйте еще раз." });
    }
  };


  if (userLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white font-mono">{t('loading')}</div>
  }
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-white border-2 border-white p-8 text-center max-w-md w-full">
          <div className="text-lg font-semibold mb-2 text-black font-mono">{t('requireLogin.title')}</div>
          <p className="text-gray-700 mb-4 font-mono">{t('requireLogin.desc')}</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/login" className="px-4 py-2 border-2 border-black text-black hover:bg-gray-100 font-mono">{t('requireLogin.login')}</Link>
            <Link href="/register" className="px-4 py-2 bg-black text-white hover:bg-gray-800 font-mono">{t('requireLogin.register')}</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto p-3 sm:p-4">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-mono">{t('title')}</h1>
          <div className="text-sm sm:text-base text-gray-400 mt-1 font-mono">{currentUser.displayName} • {currentUser.email}</div>
        </div>

        <div className="bg-white border-2 border-white mb-4 sm:mb-6">
          <div className="p-3 sm:p-4 border-b-2 border-black">
            <h2 className="text-base sm:text-lg font-bold text-black font-mono">{t('settings.title')}</h2>
          </div>
          <div className="p-3 sm:p-4 space-y-4">
            {msg && (
              <div className="flex items-center gap-2 text-black bg-gray-100 border-2 border-black px-3 py-2 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span className="font-mono">{msg}</span>
              </div>
            )}
            {errors.general && (
              <div className="flex items-center gap-2 text-black bg-gray-100 border-2 border-black px-3 py-2 text-sm">
                <XCircle className="w-4 h-4" />
                <span className="font-mono">{errors.general}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-black mb-2 font-mono">Display Name</label>
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
                  className={`w-full px-3 py-3 border-2 focus:outline-none text-base font-mono ${errors.displayName ? 'border-black focus:border-black' : 'border-gray-300 focus:border-black'}`}
                />
                {errors.displayName && (
                  <div className="flex items-center gap-1 text-black mt-2 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-mono">{errors.displayName}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
              <button 
                disabled={saving} 
                onClick={handleSaveProfile} 
                className="px-4 py-3 bg-black text-white hover:bg-gray-800 font-medium disabled:bg-gray-600 disabled:cursor-not-allowed font-mono border-2 border-black"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>

            <div className="pt-4 mt-4 border-t-2 border-black">
              <button
                onClick={handleLogout}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-white text-black hover:bg-gray-100 font-medium transition-colors font-mono border-2 border-black"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* My Forum Posts */}
        <div className="bg-white border-2 border-white mb-4 sm:mb-6">
          <div className="p-3 sm:p-4 border-b-2 border-black">
            <h2 className="text-base sm:text-lg font-bold text-black font-mono">Мои посты форума</h2>
          </div>
          <div className="p-3 sm:p-4">
            {loadingPosts ? (
              <div className="text-sm text-gray-600 font-mono">Загрузка...</div>
            ) : myPosts.length === 0 ? (
              <div className="text-sm text-gray-600 font-mono">У вас пока нет постов</div>
            ) : (
              <div className="space-y-3">
                {myPosts.map(post => (
                  <div key={post.id} className="border-2 border-gray-200 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <Link href={`/forum/${post.id}`} className="font-mono font-bold hover:underline text-black">{post.title}</Link>
                      <div className="text-xs text-gray-600 font-mono mt-1">
                        {new Date(post.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {post.isResolved ? (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 font-mono border-2 border-green-300">Решено</span>
                      ) : (
                        <button
                          onClick={() => markPostResolved(post.id)}
                          className="px-3 py-2 text-xs sm:text-sm bg-black text-white hover:bg-gray-800 font-mono border-2 border-black"
                        >
                          Отметить как решено
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}