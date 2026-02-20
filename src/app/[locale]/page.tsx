"use client"

import { easeIn, motion } from "framer-motion"
import {
  ShieldCheck,
  Gamepad2,
  BrainCircuit,
  MousePointerClick,
  Users,
  MessageCircle,
  HeartHandshake,
  Lightbulb,
  UserPlus,
  Search,
  MessagesSquare,
  Share2,
} from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import StructuredData from "@/components/StructuredData"

export default function Home() {
  const t = useTranslations("home")

  // Преимущества платформы: игры и сообщество
  const gamesBenefits = t.raw("gamesBenefits")
  const communityBenefits = t.raw("communityBenefits")
  const steps = t.raw("steps")

  // Структурированные данные для SEO (ИЗМЕНЕНО)
  const websiteData = {
    name: "Обучение защите от онлайн-мошенников | Интерактивная платформа",
    description:
      "Некоммерческая платформа с интерактивными играми и форумом для обучения распознаванию фишинга, социальной инженерии и других видов интернет-мошенничества.",
    url: "https://your-domain.com", // Замените на ваш реальный URL
  }

  const organizationData = {
    name: "Проект по цифровой безопасности", // ИЗМЕНЕНО
    url: "https://your-domain.com", // Замените на ваш реальный URL
    logo: "https://your-domain.com/logo.png", // Замените на ваш реальный URL
  }

  // Анимации (оставлены без изменений)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: easeIn,
      },
    },
  }

  const floatingVariants = {
    animate: (i = 0) => ({
      y: [0, 10, 0],
      transition: {
        duration: 4 + i * 2,
        repeat: Number.POSITIVE_INFINITY,
        ease: easeIn,
      },
    }),
  }

  // Иконки для преимуществ и шагов
  const gamesIcons = [Gamepad2, BrainCircuit, ShieldCheck, MousePointerClick]
  const communityIcons = [Users, MessageCircle, HeartHandshake, Lightbulb]
  const stepIcons = [UserPlus, Gamepad2, Search, MessagesSquare, Share2]

  return (
    <>
      <StructuredData type="WebSite" data={websiteData} />
      <StructuredData type="Organization" data={organizationData} />

      <div className="min-h-screen bg-[#01032C] text-[#A1CCB0]">
        {/* Hero-секция */}
        <section className="relative min-h-[85vh] flex items-center justify-center px-4 bg-[#01032C]">
          {/* Декоративные элементы фона */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-20 left-4 sm:left-10 w-1 sm:w-2 h-20 sm:h-32 bg-[#91B1C0]/20 rounded-full"
              custom={0}
              variants={floatingVariants}
              animate="animate"
            />
            <motion.div
              className="absolute top-40 right-4 sm:right-10 w-12 sm:w-24 h-1 sm:h-2 bg-[#91B1C0]/20 rounded-full"
              custom={1}
              variants={floatingVariants}
              animate="animate"
            />
            <motion.div
              className="hidden sm:block absolute bottom-32 left-1/4 w-12 sm:w-20 h-1 sm:h-2 bg-[#91B1C0]/20 rounded-full"
              custom={2}
              variants={floatingVariants}
              animate="animate"
            />
          </div>

          <div className="container mx-auto max-w-6xl text-center relative z-10">
            <motion.h1
              className="text-4xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight text-[#A1CCB0] font-mono px-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: easeIn }}
            >
              <span className="bg-gradient-to-r from-[#91B1C0] to-[#A1CCB0] bg-clip-text text-transparent">
                {t("heroTitle")}
              </span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-[#91B1C0] mb-8 max-w-4xl mx-auto leading-relaxed font-mono px-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: easeIn }}
            >
              {t("heroSubtitle")}
            </motion.p>

            <motion.p
              className="text-base md:text-lg text-[#A1CCB0]/80 mb-12 max-w-2xl mx-auto leading-relaxed font-mono px-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {t("mission")}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center w-full px-4 sm:px-0"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/games"
                  className="group w-full sm:w-auto text-center inline-flex items-center justify-center px-8 py-3 text-base font-bold text-[#01032C] bg-[#A1CCB0] hover:bg-[#A1CCB0]/80 border-2 border-[#A1CCB0] transition-all duration-300 font-mono rounded-full"
                >
                  <span className="mr-2">{t("ctaGames")}</span>
                  <motion.div
                    className="w-5 h-5"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                  >
                    →
                  </motion.div>
                </Link>
              </motion.div>

              <motion.div variants={itemVariants} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/forum"
                  className="w-full sm:w-auto text-center inline-flex items-center justify-center px-8 py-3 text-base font-bold text-[#91B1C0] bg-transparent border-2 border-[#91B1C0] hover:bg-[#91B1C0]/10 transition-all duration-300 font-mono rounded-full"
                >
                  {t("ctaForum")}
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Секция "Что мы предлагаем" */}
        <section className="py-24 bg-[#91B1C0]">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#01032C] font-mono">{t("featuresTitle")}</h2>
              <div className="w-24 h-1 bg-[#01032C] mx-auto rounded-full"></div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Интерактивные Игры */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                variants={containerVariants}
                className="group relative bg-[#A1CCB0] border-2 border-[#91B1C0] p-8 transition-all duration-500 shadow-lg rounded-xl"
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-[#01032C] rounded-lg">
                      <Gamepad2 className="w-7 h-7 text-[#A1CCB0]" />
                    </div>
                    <h3 className="lg:text-3xl text-xl font-bold text-[#01032C] font-mono">{t("gamesTitle")}</h3>
                  </div>
                  <ul className="space-y-6">
                    {gamesBenefits.map((b: string, i: number) => {
                      const Icon = gamesIcons[i] || ShieldCheck
                      return (
                        <motion.li
                          key={i}
                          className="flex items-start gap-4 text-lg text-[#01032C]"
                          variants={itemVariants}
                        >
                          <div className="p-2 bg-[#91B1C0] mt-1 flex-shrink-0 rounded-md">
                            <Icon className="w-5 h-5 text-[#01032C]" />
                          </div>
                          <span className="leading-relaxed font-medium font-mono">{b}</span>
                        </motion.li>
                      )
                    })}
                  </ul>
                </div>
              </motion.div>

              {/* Поддерживающее Сообщество */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                variants={containerVariants}
                className="group relative bg-[#01032C] border-2 border-[#A1CCB0] p-8 transition-all duration-500 rounded-xl"
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-[#A1CCB0] rounded-lg">
                      <Users className="w-7 h-7 text-[#01032C]" />
                    </div>
                    <h3 className="lg:text-3xl text-xl font-bold text-[#A1CCB0] font-mono">{t("communityTitle")}</h3>
                  </div>
                  <ul className="space-y-6">
                    {communityBenefits.map((b: string, i: number) => {
                      const Icon = communityIcons[i] || Users
                      return (
                        <motion.li
                          key={i}
                          className="flex items-start gap-4 text-lg text-[#91B1C0]"
                          variants={itemVariants}
                        >
                          <div className="p-2 bg-[#91B1C0]/20 mt-1 flex-shrink-0 rounded-md">
                            <Icon className="w-5 h-5 text-[#A1CCB0]" />
                          </div>
                          <span className="leading-relaxed font-medium font-mono">{b}</span>
                        </motion.li>
                      )
                    })}
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Секция "Как это работает" */}
        <section className="py-24 bg-[#01032C]">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#A1CCB0] font-mono">{t("howItWorksTitle")}</h2>
              <div className="w-24 h-1 bg-[#A1CCB0] mx-auto rounded-full"></div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
              {steps.map((step: string, i: number) => {
                const Icon = stepIcons[i] || UserPlus
                return (
                  <motion.div
                    key={i}
                    className="group relative bg-[#91B1C0] border-2 border-[#A1CCB0] p-6 transition-all duration-500 text-center rounded-xl"
                    initial="hidden"
                    whileInView="visible"
                    variants={containerVariants}
                    whileHover={{ y: -8, scale: 1.02 }}
                  >
                    <div className="relative z-10">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-[#01032C] mb-4 group-hover:scale-110 transition-transform duration-300 rounded-lg">
                        <Icon className="w-8 h-8 text-[#A1CCB0]" />
                      </div>
                      <div className="text-sm font-bold text-[#01032C] mb-2 tracking-wider font-mono">ШАГ {i + 1}</div>
                      <p className="text-base text-[#01032C] font-semibold leading-relaxed font-mono">{step}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Секция призыва к действию (CTA) */}
        <section className="py-24 bg-[#A1CCB0] text-[#01032C] text-center relative overflow-hidden">
          <div className="absolute inset-0">
            <motion.div
              className="absolute top-10 left-10 w-2 h-32 bg-[#01032C]/10 rounded-full"
              animate={{ opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-10 right-10 w-32 h-2 bg-[#01032C]/10 rounded-full"
              animate={{ opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 4 }}
            />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-8 text-[#01032C] font-mono"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              {t("ctaTitle")}
            </motion.h2>

            <motion.p
              className="text-lg md:text-xl mb-12 max-w-3xl mx-auto leading-relaxed text-[#01032C]/80 font-medium font-mono"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              {t("ctaDescription")}
            </motion.p>

            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/forum"
                className="inline-flex items-center justify-center px-12 py-4 text-lg font-bold text-[#A1CCB0] bg-[#01032C] border-2 border-[#01032C] hover:bg-[#01032C]/90 transition-all duration-300 font-mono rounded-full"
              >
                <span className="mr-2">{t("startNow")}</span>
                <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}>
                  →
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Футер */}
        <footer className="py-16 bg-[#01032C]">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              className="flex flex-col items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-base text-[#91B1C0]/80 leading-relaxed max-w-2xl font-medium font-mono">
                {t("footerText")}
              </p>
              <div className="w-16 h-1 bg-[#A1CCB0] mt-4 rounded-full"></div>
            </motion.div>
          </div>
        </footer>
      </div>
    </>
  )
}