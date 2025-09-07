"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Menu, X, Shield, Terminal, User as UserIcon } from 'lucide-react';
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


  const nav = [
    { href: `/${locale}/forum`, label: t('header.nav.forum') },
    { href: `/${locale}/forum/create`, label: t('header.nav.create') },
  ];

  const isActive = (href: string) => {
    if (href === `/${locale}`) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  const AuthButtons = ({ isMobile = false }: { isMobile?: boolean }) => (
    authLoading ? (
      <div className={`text-sm text-gray-400 font-mono ${isMobile ? 'w-full text-center p-4' : ''}`}>
        <Terminal className="w-4 h-4 inline mr-2 animate-pulse" />
        {t('loading')}
      </div>
    ) : currentUser ? (
      <Link 
        href="/profile" 
        className={isMobile 
          ? "group flex items-center justify-center gap-2 w-full px-4 py-3 bg-white text-black text-base font-bold hover:bg-gray-100 transition-all duration-300 font-mono border-2 border-white" 
          : "group flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-bold hover:bg-gray-100 transition-all duration-300 font-mono border-2 border-white"}
      >
        <UserIcon className="w-4 h-4" />
        {t('profile')}
      </Link>
    ) : (
      <div className={`flex items-center gap-2 ${isMobile ? 'flex-col w-full' : ''}`}>
        <Link 
          href="/login" 
          className={isMobile 
            ? "block w-full text-center px-4 py-3 text-base font-bold text-white bg-black border-2 border-white hover:bg-gray-800 transition-all duration-300 font-mono" 
            : "px-4 py-2 text-sm font-bold text-white bg-black border-2 border-white hover:bg-gray-800 transition-all duration-300 font-mono"}
        >
          {t('login')}
        </Link>
        <Link 
          href="/register" 
          className={isMobile 
            ? "block w-full text-center px-4 py-3 bg-white text-black text-base font-bold hover:bg-gray-100 transition-all duration-300 font-mono border-2 border-white" 
            : "px-4 py-2 bg-white text-black text-sm font-bold hover:bg-gray-100 transition-all duration-300 font-mono border-2 border-white"}
        >
          {t('register')}
        </Link>
      </div>
    )
  );

  return (
    <>
      <header className="sticky top-0 z-40 bg-black border-b-2 border-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href={`/${locale}`} className="flex items-center gap-3 group">
                <div className="p-2 bg-white group-hover:bg-gray-100 transition-colors duration-300">
                  <Shield className="w-6 h-6 text-black" />
                </div>
                <span className="text-xl font-bold text-white font-mono tracking-wider hidden sm:block">
                  {t('header.brand')}
                </span>
              </Link>
              <nav className="hidden md:flex items-center gap-1 ml-4">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 text-sm font-bold transition-all duration-300 font-mono border-2 ${
                      isActive(item.href)
                        ? 'text-black bg-white border-white'
                        : 'text-white bg-black border-transparent hover:border-white hover:bg-gray-800'
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
                className="md:hidden p-2 text-white hover:bg-gray-800 border-2 border-transparent hover:border-white transition-all duration-300"
                aria-label={t('header.openMenu')}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {isMenuVisible && (
        <div
          onClick={() => setIsMenuOpen(false)}
          className={`fixed inset-0 z-50 bg-black/80 transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`fixed top-0 right-0 h-full w-full max-w-xs bg-black border-l-2 border-white flex flex-col transition-transform duration-300 ease-in-out ${
              isMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between p-4 border-b-2 border-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white">
                  <Shield className="w-5 h-5 text-black" />
                </div>
                <span className="font-bold text-lg text-white font-mono">{t('header.brand')}</span>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)} 
                className="p-2 text-white hover:bg-gray-800 border-2 border-transparent hover:border-white transition-all duration-300"
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
                  className={`block px-4 py-3 text-base font-bold transition-all duration-300 font-mono border-2 ${
                    isActive(item.href)
                      ? 'text-black bg-white border-white'
                      : 'text-white bg-black border-transparent hover:border-white hover:bg-gray-800'
                  }`}
                >
                  {item.label.toUpperCase()}
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t-2 border-white space-y-4">
              <AuthButtons isMobile />
            </div>
          </div>
        </div>
      )}
    </>
  );
}