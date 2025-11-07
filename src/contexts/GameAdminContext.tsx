'use client';

import { 
  createContext, 
  useContext, 
  useState, 
  useCallback, 
  useMemo, 
  ReactNode 
} from 'react';
import { gameScenarioOperations } from '@/lib/firebase/database';
import type { GameScenario } from '@/types/database';

// 1. Определяем тип для данных, которые будет предоставлять контекст
interface GameAdminContextType {
  scenarios: GameScenario[];
  loading: boolean;
  error: string | null;
  loadScenarios: () => Promise<void>;
  createScenario: (data: Omit<GameScenario, 'id'>) => Promise<void>;
  updateScenario: (id: string, data: Partial<GameScenario>) => Promise<void>;
  deleteScenario: (id: string) => Promise<void>;
}

// 2. Создаем контекст с начальным значением null
const GameAdminContext = createContext<GameAdminContextType | null>(null);

// 3. Создаем компонент-провайдер
export const GameAdminProvider = ({ children }: { children: ReactNode }) => {
  // --- Состояние ---
  const [scenarios, setScenarios] = useState<GameScenario[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- Функции для работы с данными ---

  // Загрузка всех сценариев
  const loadScenarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const scenariosData = await gameScenarioOperations.list();
      setScenarios(scenariosData);
    } catch (e) {
      console.error("Error loading game scenarios:", e);
      setError("Не удалось загрузить игровые сценарии.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Создание нового сценария
  const createScenario = useCallback(async (data: Omit<GameScenario, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      await gameScenarioOperations.create(data);
      await loadScenarios(); // Перезагружаем список после создания
    } catch (e) {
      console.error("Error creating game scenario:", e);
      setError("Не удалось создать сценарий.");
      // Пробрасываем ошибку выше, если нужно обработать ее в компоненте
      throw e;
    } finally {
      setLoading(false);
    }
  }, [loadScenarios]);

  // Обновление существующего сценария
  const updateScenario = useCallback(async (id: string, data: Partial<GameScenario>) => {
    setLoading(true);
    setError(null);
    try {
      await gameScenarioOperations.update(id, data);
      await loadScenarios(); // Перезагружаем список после обновления
    } catch (e) {
      console.error("Error updating game scenario:", e);
      setError("Не удалось обновить сценарий.");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [loadScenarios]);

  // Удаление сценария
  const deleteScenario = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await gameScenarioOperations.delete(id);
      await loadScenarios(); // Перезагружаем список после удаления
    } catch (e) {
      console.error("Error deleting game scenario:", e);
      setError("Не удалось удалить сценарий.");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [loadScenarios]);

  // 4. Мемоизируем значение контекста, чтобы избежать лишних рендеров
  const contextValue = useMemo(() => ({
    scenarios,
    loading,
    error,
    loadScenarios,
    createScenario,
    updateScenario,
    deleteScenario,
  }), [
    scenarios,
    loading,
    error,
    loadScenarios,
    createScenario,
    updateScenario,
    deleteScenario
  ]);

  return (
    <GameAdminContext.Provider value={contextValue}>
      {children}
    </GameAdminContext.Provider>
  );
};

// 5. Создаем кастомный хук для удобного использования контекста
export const useGameAdmin = () => {
  const context = useContext(GameAdminContext);
  if (!context) {
    throw new Error('useGameAdmin must be used within a GameAdminProvider');
  }
  return context;
};