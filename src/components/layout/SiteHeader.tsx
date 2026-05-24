"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Shield, Terminal, User as UserIcon } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useTranslations } from 'next-intl';

interface Props {
  locale: string;
}

export default function SiteHeader({ locale }: Props) {
  const { currentUser, loading: authLoading } = useUser();
  const pathname = usePathname();
  const t = useTranslations('common');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // Логика управления состоянием меню (без изменений)
  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuVisible(true);
    } else {
      const timer = setTimeout(() => setIsMenuVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [pathname]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  // Навигационные ссылки (без изменений)
  const nav = [
    { href: `/${locale}/forum`, label: t('header.nav.forum') },
    { href: `/${locale}/blog`, label: t('header.nav.blog') },
    { href: `/${locale}/chat`, label: t('header.nav.chat') },
    { href: `/${locale}/games`, label: "игры" },
    { href: `/${locale}/telefone`, label: "симулятор" }
  ];

  const isActive = (href: string) => {
    if (href === `/${locale}`) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  // Компонент кнопок авторизации с новой палитрой
  const AuthButtons = ({ isMobile = false }: { isMobile?: boolean }) => (
    authLoading ? (
      <div className={`text-sm text-[#718096] font-mono ${isMobile ? 'w-full text-center p-4' : ''}`}>
        <Terminal className="w-4 h-4 inline mr-2 animate-pulse" />
        {t('loading')}
      </div>
    ) : currentUser ? (
      // Кнопка "Профиль" (основной стиль)
      <Link
        href="/profile"
        className={`group flex items-center justify-center gap-2 w-full transition-all duration-300 font-mono rounded-full ${
          isMobile
            ? "px-4 py-3 bg-[#4299E1] text-white text-base font-bold hover:bg-[#3182CE]"
            : "px-4 py-2 bg-[#4299E1] text-white text-sm font-bold hover:bg-[#3182CE]"
        }`}
      >
        <UserIcon className="w-4 h-4" />
        {t('profile')}
      </Link>
    ) : (
      <div className={`flex items-center gap-2 ${isMobile ? 'flex-col w-full' : ''}`}>
        {/* Кнопка "Войти" (вторичный стиль) */}
        <Link
          href="/login"
          className={`w-full text-center transition-all duration-300 font-mono rounded-full border-2 ${
            isMobile
              ? "block px-4 py-3 text-base font-bold text-[#2D3748] border-[#CBD5E0] hover:bg-gray-100"
              : "px-4 py-2 text-sm font-bold text-[#2D3748] border-[#CBD5E0] hover:bg-gray-100"
          }`}
        >
          {t('login')}
        </Link>
        {/* Кнопка "Регистрация" (основной стиль) */}
        <Link
          href="/register"
          className={`w-full text-center transition-all duration-300 font-mono rounded-full ${
            isMobile
              ? "block px-4 py-3 bg-[#4299E1] text-white text-base font-bold hover:bg-[#3182CE]"
              : "px-4 py-2 bg-[#4299E1] text-white text-sm font-bold hover:bg-[#3182CE]"
          }`}
        >
          {t('register')}
        </Link>
      </div>
    )
  );

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href={`/${locale}`} className="flex items-center gap-3 group">
                <div className="p-2 bg-[#4299E1] group-hover:bg-[#3182CE] transition-colors duration-300 rounded-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </Link>
              <nav className="hidden md:flex items-center gap-1 ml-4">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 text-sm font-bold transition-all duration-300 font-mono rounded-lg ${
                      isActive(item.href)
                        ? 'text-white bg-[#4299E1]'
                        : 'text-[#718096] hover:text-[#2D3748] hover:bg-gray-100'
                    }`}
                  >
                    {item.label.toUpperCase()}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex">
                <AuthButtons />
              </div>

              <button
                onClick={() => setIsMenuOpen(true)}
                className="md:hidden p-2 text-[#718096] hover:bg-gray-100 transition-all duration-300 rounded-lg"
                aria-label={t('header.openMenu')}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Мобильное меню */}
      {isMenuVisible && (
        <div
          onClick={() => setIsMenuOpen(false)}
          className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`fixed top-0 right-0 h-full w-full max-w-xs bg-white flex flex-col transition-transform duration-300 ease-in-out ${
              isMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between p-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#4299E1] rounded-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg text-[#2D3748] font-mono">{t('header.brand')}</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-[#718096] hover:bg-gray-100 transition-all duration-300 rounded-lg"
                aria-label={t('header.closeMenu')}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-grow p-4 space-y-2">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block text-center px-4 py-3 text-base font-bold transition-all duration-300 font-mono rounded-lg ${
                    isActive(item.href)
                      ? 'text-white bg-[#4299E1]'
                      : 'text-[#2D3748] bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {item.label.toUpperCase()}
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-[#E2E8F0]">
              <AuthButtons isMobile />
            </div>
          </div>
        </div>
      )}
    </>
  );
}