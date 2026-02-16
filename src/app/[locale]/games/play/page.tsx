'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle, XCircle, Award, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import Link from 'next/link';

export default function GamePlayPage() {
  const t = useTranslations('gamePlay');
  const router = useRouter();
  const {
    activeSession,
    currentScenario,
    lastAnswerResult,
    gameIsOver,
    loadingSession,
    loadingCurrentScenario,
    submitAnswer,
    startGame, // Для кнопки \"Сыграть еще раз\"
    clearLastAnswerResult, // Добавлено
  } = useGame();

  const [showResultDelay, setShowResultDelay] = useState(false);

  useEffect(() => {
    if (lastAnswerResult) {
      setShowResultDelay(true);
      const timer = setTimeout(() => {
        setShowResultDelay(false);
        clearLastAnswerResult(); // Очищаем результат после задержки
      }, 5000); // Задержка в 5 секунд
      return () => clearTimeout(timer);
    }
  }, [lastAnswerResult, clearLastAnswerResult]);

  // Если пользователь попал сюда без активной сессии, отправляем его обратно
  useEffect(() => {
    if (!loadingSession && !activeSession) {
      router.replace('/games');
    }
  }, [loadingSession, activeSession, router]);

  const handlePlayAgain = async () => {
    if (activeSession) {
      await startGame(activeSession.scenarioIds.length);
    }
  };

  // Основной рендер в зависимости от состояния игры
  const renderGameState = () => {
    // 1. Игра окончена
    if (gameIsOver && activeSession) {
      const score = activeSession.score;
      const total = activeSession.scenarioIds.length;
      const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

      return (
        <motion.div
          key="game-over"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Award className="w-24 h-24 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-4xl font-bold text-white font-mono mb-2">{t('gameOverTitle')}</h2>
          <p className="text-lg text-[#A1CCB0] font-mono mb-6">{t('finalScore', { score, total })}</p>
          <div className="w-full bg-[#91B1C0]/20 rounded-full h-4 mb-6">
            <div
              className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <button
            onClick={handlePlayAgain}
            className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-[#A1CCB0] text-[#01032C] hover:bg-[#A1CCB0]/80 font-mono font-bold border-2 border-[#A1CCB0] rounded-lg transition-colors"
          >
            {t('playAgainButton')}
          </button>
        </motion.div>
      );
    }

    // 2. Показываем результат ответа
    if (lastAnswerResult && showResultDelay) {
      return (
        <motion.div
          key="answer-result"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="text-center"
        >
          {lastAnswerResult.isCorrect ? (
            <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
          ) : (
            <XCircle className="w-24 h-24 text-red-500 mx-auto mb-4" />
          )}
          <h2 className={`text-4xl font-bold font-mono mb-4 ${lastAnswerResult.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {lastAnswerResult.isCorrect ? t('correct') : t('incorrect')}
          </h2>
          <p className="text-lg text-[#91B1C0] font-mono mb-6">{lastAnswerResult.explanation}</p>
          
          <button
            onClick={() => {
              setShowResultDelay(false);
              clearLastAnswerResult();
            }}
            className="inline-flex justify-center items-center gap-2 px-8 py-3 bg-[#A1CCB0] text-[#01032C] hover:bg-[#A1CCB0]/80 font-mono font-bold border-2 border-[#A1CCB0] rounded-lg transition-colors mt-4"
          >
            {t('nextButton') || "Next"} 
          </button>

          {loadingCurrentScenario && (
            <div className="flex justify-center items-center gap-2 mt-8 text-sm font-mono">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('loadingNext')}
            </div>
          )}
        </motion.div>
      );
    }

    // 3. Показываем текущий вопрос
    if (currentScenario && activeSession) {
      return (
        <motion.div
          key={currentScenario.id}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
        >
          <p className="font-mono text-sm text-[#A1CCB0] mb-4 text-center">
            {t('questionProgress', { current: activeSession.currentScenarioIndex + 1, total: activeSession.scenarioIds.length })}
          </p>
          <p className="text-xl md:text-2xl text-white font-mono text-center mb-10 leading-relaxed">
            {currentScenario.description}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <button
              onClick={() => submitAnswer(true)}
              className="p-6 bg-[#91B1C0]/10 border-2 border-[#91B1C0]/30 rounded-lg text-lg font-mono text-white hover:bg-red-500/20 hover:border-red-500 transition-all"
            >
              {t('scamButton')}
            </button>
            <button
              onClick={() => submitAnswer(false)}
              className="p-6 bg-[#91B1C0]/10 border-2 border-[#91B1C0]/30 rounded-lg text-lg font-mono text-white hover:bg-green-500/20 hover:border-green-500 transition-all"
            >
              {t('notScamButton')}
            </button>
          </div>
        </motion.div>
      );
    }

    // 4. Состояние загрузки по умолчанию
    return (
      <div key="loading" className="text-center">
        <Loader2 className="w-12 h-12 mx-auto animate-spin text-[#A1CCB0]" />
        <p className="mt-4 text-lg font-mono">{t('loadingGame')}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#01032C] text-[#91B1C0] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="bg-[#01032C] border-2 border-[#91B1C0]/20 p-8 md:p-12 rounded-xl shadow-2xl shadow-black/20">
          <AnimatePresence mode="wait">
            {renderGameState()}
          </AnimatePresence>
        </div>
        <div className="text-center mt-6">
          <Link href="/games" className="text-sm font-mono hover:text-white transition-colors">
            {t('backToGames')}
          </Link>
        </div>
      </div>
    </div>
  );
}
