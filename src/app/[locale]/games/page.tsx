'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { 
  PlayCircle, 
  Gamepad2, 
  Loader2, 
  ChevronRight, 
  Shuffle, 
  Mail, 
  Users, 
  Globe, 
  Phone, 
  AtSign, 
  TrendingUp, 
  UserX, 
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { useUser } from '@/contexts/UserContext';

// Категории игр с текстом на русском языке
const GAME_CATEGORIES = [
  { id: 'all', label: 'Все сценарии', description: 'Случайный микс из всех вопросов', icon: Shuffle, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  { id: 'phishing', label: 'Фишинг', description: 'Распознайте поддельные сайты и письма', icon: Mail, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  { id: 'social_engineering', label: 'Социальная инженерия', description: 'Не дайте себя обмануть манипуляторам', icon: Users, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
  { id: 'fake_websites', label: 'Поддельные сайты', description: 'Найдите отличия от оригинала', icon: Globe, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' },
  { id: 'phone_scams', label: 'Телефонное мошенничество', description: 'Звонки от "службы безопасности"', icon: Phone, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
  { id: 'email_scams', label: 'Email мошенничество', description: 'Опасные вложения и ссылки', icon: AtSign, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
  { id: 'investment_fraud', label: 'Инвестиционное мошенничество', description: 'Пирамиды и "выгодные" предложения', icon: TrendingUp, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
  { id: 'identity_theft', label: 'Кража личности', description: 'Защита персональных данных', icon: UserX, color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/20' },
  { id: 'other', label: 'Другое', description: 'Различные виды мошенничества', icon: HelpCircle, color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/20' },
];

export default function GamesPage() {
  const { currentUser } = useUser();
  const {
    loadingScenarios,
    loadingSession,
    startGame,
    activeSession,
  } = useGame();
  const router = useRouter();
  const [startingCategory, setStartingCategory] = useState<string | null>(null);

  const handleStartGame = async (category: string) => {
    if (!currentUser) {
      alert("Пожалуйста, войдите в систему, чтобы начать игру.");
      return;
    }
    
    setStartingCategory(category);
    
    try {
      // Начинаем игру с выбранной категорией
      const session = await startGame(10, category);
      if (session) {
        router.push('/games/play');
      } else {
        // Если сессия не создалась (например, нет вопросов в категории)
        alert("В этой категории пока нет вопросов.");
        setStartingCategory(null);
      }
    } catch (error) {
      console.error("Failed to start game:", error);
      alert("Не удалось начать игру. Пожалуйста, попробуйте снова.");
      setStartingCategory(null);
    }
  };

  const hasActiveSession = !!activeSession && activeSession.status === 'in-progress';

  return (
    <div className="min-h-screen bg-[#01032C] text-[#91B1C0]">
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
                <Gamepad2 className="w-8 h-8 text-[#01032C]" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-mono text-[#A1CCB0]">Игры</h1>
            </div>
            <p className="text-lg sm:text-xl text-[#91B1C0] font-mono">Проверьте свои знания и научитесь распознавать мошенников!</p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {loadingScenarios || loadingSession ? (
            <div className="text-center py-20">
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-[#A1CCB0]" />
              <div className="text-xl font-mono text-[#91B1C0] mt-4">Загрузка игр...</div>
            </div>
          ) : (
            <div className="space-y-12">
              
              {/* Блок активной сессии */}
              {hasActiveSession && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#01032C] border-2 border-yellow-400/50 p-6 rounded-xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <PlayCircle className="w-32 h-32 text-yellow-400" />
                  </div>
                  
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <h3 className="text-2xl font-bold text-yellow-400 font-mono mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6" />
                        У вас есть незаконченная игра!
                      </h3>
                      <p className="text-[#91B1C0] font-mono">
                        Вы остановились на вопросе {activeSession.currentScenarioIndex + 1} из {activeSession.scenarioIds.length}.
                      </p>
                    </div>
                    
                    <button
                      onClick={() => router.push('/games/play')}
                      className="w-full md:w-auto px-8 py-4 bg-yellow-400 text-[#01032C] hover:bg-yellow-300 font-mono font-bold border-2 border-yellow-400 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-yellow-400/20"
                    >
                      Продолжить игру
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Сетка категорий */}
              <div>
                <h2 className="text-2xl font-bold text-white font-mono mb-6 flex items-center gap-2">
                  <Gamepad2 className="w-6 h-6 text-[#A1CCB0]" />
                  Выберите режим игры
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {GAME_CATEGORIES.map((category, index) => {
                    const Icon = category.icon;
                    const isStarting = startingCategory === category.id;
                    
                    return (
                      <motion.button
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleStartGame(category.id)}
                        disabled={!!startingCategory}
                        className={`group relative p-6 rounded-xl border-2 transition-all duration-300 text-left h-full flex flex-col
                          ${category.bg} ${category.border} hover:border-opacity-100 hover:scale-[1.02]
                          ${startingCategory && !isStarting ? 'opacity-50 grayscale' : ''}
                        `}
                      >
                        <div className={`mb-4 p-3 rounded-lg inline-block bg-[#01032C]/50 ${category.color}`}>
                          {isStarting ? (
                            <Loader2 className="w-8 h-8 animate-spin" />
                          ) : (
                            <Icon className="w-8 h-8" />
                          )}
                        </div>
                        
                        <h3 className={`text-xl font-bold mb-2 font-mono ${category.color}`}>
                          {category.label}
                        </h3>
                        
                        <p className="text-[#91B1C0] text-sm font-mono mb-4 flex-grow">
                          {category.description}
                        </p>
                        
                        <div className={`mt-auto flex items-center gap-2 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity ${category.color}`}>
                          Начать игру <ChevronRight className="w-4 h-4" />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}