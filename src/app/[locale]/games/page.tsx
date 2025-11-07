'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { PlayCircle, Gamepad2, Loader2, ChevronRight, Link } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { useUser } from '@/contexts/UserContext';

export default function GamesPage() {
  const t = useTranslations('games');
  const { currentUser } = useUser();
  const {
    scenarios,
    loadingScenarios,
    loadingSession,
    startGame,
    activeSession,
  } = useGame();
  const router = useRouter();

  const handleStartGame = async () => {
    if (!currentUser) {
      // В идеале здесь должна быть модалка для входа или редирект
      alert(t('loginPrompt'));
      return;
    }
    try {
      // Начинаем игру со всеми доступными сценариями
      await startGame(scenarios.length);
      router.push('/games/play');
    } catch (error) {
      console.error("Failed to start game:", error);
      alert(t('startGameError'));
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
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-mono text-[#A1CCB0]">{t('title')}</h1>
            </div>
            <p className="text-lg sm:text-xl text-[#91B1C0] font-mono">{t('subtitle')}</p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {loadingScenarios || loadingSession ? (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-[#A1CCB0]" />
              <div className="text-xl font-mono text-[#91B1C0] mt-4">{t('loadingGames')}</div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-[#01032C] border-2 border-[#91B1C0]/20 p-8 hover:border-[#A1CCB0] transition-colors duration-300 rounded-xl text-center"
            >
              <PlayCircle className="w-16 h-16 text-[#A1CCB0] mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2 text-white font-mono">
                {t('mainGameTitle')}
              </h3>
              <p className="text-[#91B1C0] font-mono mb-6">
                {t('mainGameDescription', { count: scenarios.length })}
              </p>

                {hasActiveSession ? (
                <div>
                    <p className="font-mono text-sm text-yellow-400 mb-4">
                    {t('gameInProgress')} ({activeSession.currentScenarioIndex}/{activeSession.scenarioIds.length})
                    </p>
                    <button
                    onClick={() => router.push('/games/play')}
                    className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-8 py-4 bg-yellow-400 text-[#01032C] hover:bg-yellow-300 font-mono font-bold border-2 border-yellow-400 rounded-lg transition-colors"
                    >
                    {t('continueButton')}
                    <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
                ) : (
                <button
                  onClick={handleStartGame}
                  disabled={loadingSession}
                  className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-8 py-4 bg-[#A1CCB0] text-[#01032C] hover:bg-[#A1CCB0]/80 font-mono font-bold border-2 border-[#A1CCB0] rounded-lg transition-colors disabled:opacity-50"
                >
                  {t('playButton')}
                  <PlayCircle className="w-5 h-5" />
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}