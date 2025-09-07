"use client"

import { motion } from "framer-motion"
import {
  Shield,
  Lock,
  Eye,
  User,
  Users,
  ShieldCheck,
  Terminal,
  CheckCircle,
  MessageCircle,
  AlertTriangle,
  Database,
  Network,
} from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import StructuredData from "@/components/StructuredData"

export default function Home() {
  const t = useTranslations("home")

  // Преимущества для клиентов и мастеров
  const clientBenefits = t.raw("clientBenefits")
  const proBenefits = t.raw("proBenefits")
  const steps = t.raw("steps")

  // Структурированные данные для SEO
  const websiteData = {
    name: "Digital Fortress",
    description: "Advanced cybersecurity education platform with hands-on training and real-world scenarios.",
    url: "https://digitalfortress.edu"
  }

  const organizationData = {
    name: "Digital Fortress",
    url: "https://digitalfortress.edu",
    logo: "https://digitalfortress.edu/logo.png"
  }

  // Анимации
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  }

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 6,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  }

  // Иконки для преимуществ
  const clientIcons = [Shield, ShieldCheck, Eye, Lock]
  const proIcons = [Users, Terminal, Database, Network]
  const stepIcons = [User, Shield, CheckCircle, AlertTriangle, MessageCircle]

  return (
    <>
      <StructuredData type="WebSite" data={websiteData} />
      <StructuredData type="Organization" data={organizationData} />
      
      <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-4 bg-black">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-2 h-32 bg-white/10"
            variants={floatingVariants}
            animate="animate"
          />
          <motion.div
            className="absolute top-40 right-20 w-24 h-2 bg-white/10"
            variants={floatingVariants}
            animate="animate"
            transition={{ delay: 1 }}
          />
          <motion.div
            className="absolute bottom-32 left-1/4 w-20 h-2 bg-white/10"
            variants={floatingVariants}
            animate="animate"
            transition={{ delay: 2 }}
          />
        </div>

        <div className="container mx-auto max-w-6xl text-center relative z-10">
          <motion.div
            className="inline-flex items-center gap-3 px-4 py-2 bg-white text-black mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Shield className="w-4 h-4" />
            <span className="text-sm font-mono font-semibold tracking-wider">DIGITAL FORTRESS</span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight text-white font-mono"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <span className="text-white">{t("heroTitle")}</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto font-normal leading-relaxed font-mono"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            {t("heroSubtitle")}
          </motion.p>

          <motion.p
            className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            {t("mission")}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/register"
                className="group inline-flex items-center justify-center px-12 py-4 text-lg font-semibold text-black bg-white hover:bg-gray-100 border-2 border-white transition-all duration-300 font-mono"
              >
                <span className="mr-2">{t("getStartedClient")}</span>
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
                href="/register?pro=1"
                className="inline-flex items-center justify-center px-12 py-4 text-lg font-semibold text-white bg-black border-2 border-white hover:bg-gray-800 transition-all duration-300 font-mono"
              >
                {t("getStartedPro")}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Преимущества */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black font-mono">{t("featuresTitle")}</h2>
            <div className="w-24 h-1 bg-black mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Для студентов */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              variants={containerVariants}
              className="group relative bg-white border-2 border-black p-8 transition-all duration-500"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-black">
                    <User className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-black font-mono">{t("clientBenefitsTitle")}</h3>
                </div>
                <ul className="space-y-6">
                  {clientBenefits.map((b: string, i: number) => {
                    const Icon = clientIcons[i] || Shield
                    return (
                      <motion.li
                        key={i}
                        className="flex items-start gap-4 text-lg text-black"
                        variants={itemVariants}
                      >
                        <div className="p-2 bg-gray-100 mt-1 flex-shrink-0">
                          <Icon className="w-5 h-5 text-black" />
                        </div>
                        <span className="leading-relaxed font-medium font-mono">{b}</span>
                      </motion.li>
                    )
                  })}
                </ul>
              </div>
            </motion.div>

            {/* Для инструкторов */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              variants={containerVariants}
              className="group relative bg-black border-2 border-black p-8 transition-all duration-500"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-white">
                    <Terminal className="w-7 h-7 text-black" />
                  </div>
                  <h3 className="text-2xl font-bold text-white font-mono">{t("proBenefitsTitle")}</h3>
                </div>
                <ul className="space-y-6">
                  {proBenefits.map((b: string, i: number) => {
                    const Icon = proIcons[i] || Users
                    return (
                      <motion.li
                        key={i}
                        className="flex items-start gap-4 text-lg text-white"
                        variants={itemVariants}
                      >
                        <div className="p-2 bg-gray-800 mt-1 flex-shrink-0">
                          <Icon className="w-5 h-5 text-white" />
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

      {/* Как это работает */}
      <section className="py-24 bg-black">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white font-mono">{t("howItWorksTitle")}</h2>
            <div className="w-24 h-1 bg-white mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
            {steps.map((step: string, i: number) => {
              const Icon = stepIcons[i] || CheckCircle
              return (
                <motion.div
                  key={i}
                  className="group relative bg-white border-2 border-white p-6 transition-all duration-500 text-center"
                  initial="hidden"
                  whileInView="visible"
                  variants={containerVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-black mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-sm font-bold text-black mb-2 tracking-wide font-mono">STEP {i + 1}</div>
                    <span className="text-base text-black font-semibold leading-relaxed font-mono">{step}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white text-black text-center relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-10 left-10 w-2 h-32 bg-black/10"
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-10 right-10 w-32 h-2 bg-black/10"
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 4 }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-8 text-black font-mono"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            {t("ctaTitle")}
          </motion.h2>

          <motion.p
            className="text-xl mb-12 max-w-3xl mx-auto leading-relaxed text-gray-600 font-medium font-mono"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            {t("ctaDescription")}
          </motion.p>

          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-12 py-4 text-lg font-semibold text-white bg-black border-2 border-black hover:bg-gray-800 transition-all duration-300 font-mono"
            >
              <span className="mr-2">{t("startNow")}</span>
              <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}>
                →
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-black">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white text-black">
                <Shield className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-white font-mono">DIGITAL FORTRESS</span>
            </div>
            <p className="text-gray-400 text-lg leading-relaxed max-w-2xl font-medium font-mono">{t("footerText")}</p>
            <div className="w-16 h-1 bg-white mt-4"></div>
          </motion.div>
        </div>
      </footer>
    </div>
    </>
  )
}
