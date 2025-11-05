import type { SeoConfig } from '../../types/seo';

export const seoConfig: SeoConfig = {
  // Основная информация о сайте
  siteName: 'Digital Fortress',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://digitalfortress.vercel.app',
  description: 'Портфолио, демонстрирующее опыт в выявлении и смягчении цифровых угроз, с коллекцией решенных кейсов по кибербезопасности и форумом для обсуждений.',
  
  // Ключевые слова для поисковых систем
  keywords: [
    'кибербезопасность',
    'цифровые угрозы',
    'смягчение угроз',
    'информационная безопасность',
    'портфолио по кибербезопасности',
    'этичный хакинг',
    'тестирование на проникновение',
    'анализ уязвимостей',
    'анализ вредоносных программ',
    'реагирование на инциденты',
    'форум по кибербезопасности',
    'фишинг',
    'мошенничество',
    'защита данных'
  ],

  // Информация об авторе и издателе
  author: 'Digital Fortress Team',
  creator: 'Digital Fortress',
  publisher: 'Digital Fortress',

  // Open Graph метаданные (для Facebook, LinkedIn и т.д.)
  openGraph: {
    type: 'website',
    locale: 'ru_RU', // Указываем русскую локаль
    siteName: 'Digital Fortress',
    images: [
      {
        url: '/og-image.png', // Рекомендуется создать специальное изображение для соцсетей
        width: 1200,
        height: 630,
        alt: 'Digital Fortress - Форум и портфолио по кибербезопасности',
      },
    ],
  },

  // Twitter метаданные
  twitter: {
    card: 'summary_large_image',
    creator: '@DigitalFortress', // Замените на ваш реальный Twitter handle, если он есть
    images: ['/twitter-image.png'], // Можно использовать то же изображение, что и для Open Graph
  },

  // Инструкции для поисковых роботов
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Коды верификации для поисковых систем
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || 'your-google-verification-code',
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || 'your-yandex-verification-code',
  },
};