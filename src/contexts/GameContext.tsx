'use client';
import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { 
  gameScenarioOperations,
  gameSessionOperations,
  userAnswerOperations
} from '@/lib/firebase/database';
import { useUser } from './UserContext';
import type { 
  GameScenario,
  GameSession
} from '@/types/database';

// Функция для перемешивания массива (алгоритм Фишера-Йейтса)
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

interface GameContextType {
  // Состояние игры
  scenarios: GameScenario[];
  activeSession: GameSession | null;
  currentScenario: GameScenario | null;
  lastAnswerResult: {
    isCorrect: boolean;
    explanation: string;
  } | null;
  gameIsOver: boolean;

  // Состояния загрузки
  loadingScenarios: boolean;
  loadingSession: boolean;
  loadingCurrentScenario: boolean;

  // Операции
startGame: (scenarioCount?: number) => Promise<GameSession | null>;
  loadActiveSession: () => Promise<void>;
  submitAnswer: (userGuess: boolean) => Promise<void>;
  endGame: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useUser();

  // Состояние
  const [scenarios, setScenarios] = useState<GameScenario[]>([]);
  const [activeSession, setActiveSession] = useState<GameSession | null>(null);
  const [currentScenario, setCurrentScenario] = useState<GameScenario | null>(null);
  const [lastAnswerResult, setLastAnswerResult] = useState<{ isCorrect: boolean; explanation: string } | null>(null);

  // Состояния загрузки
  const [loadingScenarios, setLoadingScenarios] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  const [loadingCurrentScenario, setLoadingCurrentScenario] = useState(false);

  // Кэш для сценариев, так как они меняются редко
  const [scenariosCache, setScenariosCache] = useState<{ data: GameScenario[], timestamp: number } | null>(null);
  const CACHE_DURATION = 10 * 60 * 1000; // 10 минут

  const isCacheValid = useCallback((timestamp: number) => {
    return Date.now() - timestamp < CACHE_DURATION;
  }, [CACHE_DURATION]);

  // Загрузка всех сценариев с кэшированием
  const loadScenarios = useCallback(async () => {
    if (scenariosCache && isCacheValid(scenariosCache.timestamp)) {
      setScenarios(scenariosCache.data);
      return;
    }
    setLoadingScenarios(true);
    try {
      const scenariosData = await gameScenarioOperations.list();
      setScenarios(scenariosData);
      setScenariosCache({ data: scenariosData, timestamp: Date.now() });
    } catch (error) {
      console.error("Error loading game scenarios:", error);
    } finally {
      setLoadingScenarios(false);
    }
  }, [scenariosCache, isCacheValid]);

  // Загрузка активной сессии пользователя
  const loadActiveSession = useCallback(async () => {
    if (!currentUser) return;
    setLoadingSession(true);
    try {
      const session = await gameSessionOperations.getActiveSession(currentUser.userId);
      setActiveSession(session);
      // Если сессия найдена, очищаем результат предыдущего ответа
      if (session) {
        setLastAnswerResult(null);
      }
    } catch (error) {
      console.error("Error loading active game session:", error);
    } finally {
      setLoadingSession(false);
    }
  }, [currentUser]);

  // Начало новой игры
  const startGame = useCallback(async (scenarioCount = 10): Promise<GameSession | null> => {
  if (!currentUser) {
    console.error("User must be logged in to start a game.");
    return null;
  }
  if (scenarios.length === 0) {
    await loadScenarios();
  }

  setLoadingSession(true);
  try {
    const shuffledScenarios = shuffleArray(scenarios);
    const gameScenarios = shuffledScenarios.slice(0, Math.min(scenarioCount, scenarios.length));
    const scenarioIds = gameScenarios.map(s => s.id);

    const now = new Date().toISOString();
    const newSessionData = {
      userId: currentUser.userId,
      scenarioIds,
      currentScenarioIndex: 0,
      score: 0,
      status: 'in-progress' as const,
      createdAt: now,
      updatedAt: now,
    };

    const newSession = await gameSessionOperations.create(newSessionData);
    setActiveSession(newSession);
    setLastAnswerResult(null);
    return newSession; // <-- ВАЖНО: Возвращаем созданную сессию
  } catch (error) {
    console.error("Error starting new game:", error);
    return null; // <-- Возвращаем null в случае ошибки
  } finally {
    setLoadingSession(false);
  }
}, [currentUser, scenarios, loadScenarios]);

  // Отправка ответа
  const submitAnswer = useCallback(async (userGuess: boolean) => {
    if (!currentUser || !activeSession || !currentScenario) return;

    const isCorrect = userGuess === currentScenario.isScam;
    const explanation = userGuess ? currentScenario.explanationForScam : currentScenario.explanationForNotScam;
    
    setLastAnswerResult({ isCorrect, explanation });

    // Сохраняем ответ в БД
    await userAnswerOperations.create({
      sessionId: activeSession.id,
      scenarioId: currentScenario.id,
      userId: currentUser.userId,
      userGuess,
      isCorrect,
      answeredAt: new Date().toISOString(),
    });

    const newScore = isCorrect ? activeSession.score + 1 : activeSession.score;
    const newIndex = activeSession.currentScenarioIndex + 1;
    const isGameOver = newIndex >= activeSession.scenarioIds.length;

    const updatedSessionData = {
      score: newScore,
      currentScenarioIndex: newIndex,
      status: isGameOver ? 'completed' as const : 'in-progress' as const,
    };

    // Обновляем сессию в БД и локально
    await gameSessionOperations.update(activeSession.id, updatedSessionData);
    setActiveSession(prev => prev ? { ...prev, ...updatedSessionData } : null);

  }, [currentUser, activeSession, currentScenario]);

  // Завершение/сброс игры
  const endGame = useCallback(() => {
    if (activeSession) {
      gameSessionOperations.update(activeSession.id, { status: 'completed' });
    }
    setActiveSession(null);
    setCurrentScenario(null);
    setLastAnswerResult(null);
  }, [activeSession]);

  // Эффект для загрузки текущего сценария при изменении сессии
useEffect(() => {
  if (!activeSession || activeSession.status === 'completed') {
    setCurrentScenario(null);
    return;
  }

  const loadCurrentScenario = async () => {
    setLoadingCurrentScenario(true);
    try {
      // 1. Получаем ID текущего сценария из сессии
      const scenarioId = activeSession.scenarioIds[activeSession.currentScenarioIndex];
      
      // 2. Получаем данные сценария (без ID) из базы данных
      const scenarioData = await gameScenarioOperations.read(scenarioId);

      if (scenarioData) {
        // 3. ВАЖНО: Добавляем ID к данным перед сохранением в состояние
        setCurrentScenario({ ...scenarioData, id: scenarioId });
      } else {
        setCurrentScenario(null);
      }
      
      // 4. Сбрасываем результат предыдущего ответа при показе нового вопроса
      setLastAnswerResult(null);
    } catch (error) {
      console.error("Error loading current scenario:", error);
      setCurrentScenario(null);
    } finally {
      setLoadingCurrentScenario(false);
    }
  };

  loadCurrentScenario();
}, [activeSession]);

  // Загрузка сценариев и активной сессии при монтировании и смене пользователя
  useEffect(() => {
    loadScenarios();
    if (currentUser) {
      loadActiveSession();
    } else {
      // Если пользователь вышел, сбрасываем сессию
      setActiveSession(null);
    }
  }, [currentUser, loadScenarios]); // `loadActiveSession` не включен, чтобы избежать лишних вызовов

  const gameIsOver = useMemo(() => {
    if (!activeSession) return false;
    return activeSession.status === 'completed';
  }, [activeSession]);

  const contextValue = useMemo(() => ({
    scenarios,
    activeSession,
    currentScenario,
    lastAnswerResult,
    gameIsOver,
    loadingScenarios,
    loadingSession,
    loadingCurrentScenario,
    startGame,
    loadActiveSession,
    submitAnswer,
    endGame,
  }), [
    scenarios,
    activeSession,
    currentScenario,
    lastAnswerResult,
    gameIsOver,
    loadingScenarios,
    loadingSession,
    loadingCurrentScenario,
    startGame,
    loadActiveSession,
    submitAnswer,
    endGame
  ]);

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};