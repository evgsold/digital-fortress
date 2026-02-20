"use client"

import React, { useEffect, useState, useMemo } from "react"
import {
  MessageCircle, Search, Plus, Edit, Trash2, Eye,
  Loader2, AlertTriangle, CheckCircle, XCircle, Gamepad2, HelpCircle
} from "lucide-react"

// 1. Импортируем хук из вашего нового контекста для управления играми
// (Предполагается, что вы его создадите по аналогии с BlogAdminContext)
import { useGameAdmin } from "@/contexts/index" 
import type { GameScenario } from '@/types/database'

const SCENARIO_CATEGORIES = [
  { value: 'phishing', label: 'Фишинг' },
  { value: 'social_engineering', label: 'Социальная инженерия' },
  { value: 'fake_websites', label: 'Поддельные сайты' },
  { value: 'phone_scams', label: 'Телефонное мошенничество' },
  { value: 'email_scams', label: 'Email мошенничество' },
  { value: 'investment_fraud', label: 'Инвестиционное мошенничество' },
  { value: 'identity_theft', label: 'Кража личности' },
  { value: 'other', label: 'Другое' },
];

// --- КОМПОНЕНТ РЕДАКТОРА СЦЕНАРИЕВ ---
const ScenarioEditorModal = ({
  show,
  onClose,
  onSave,
  initialScenario,
  loading
}: {
  show: boolean;
  onClose: () => void;
  onSave: (scenarioData: Partial<GameScenario>) => void;
  initialScenario: Partial<GameScenario> | null;
  loading: boolean;
}) => {
  const [scenarioData, setScenarioData] = useState<Partial<GameScenario>>({});

  useEffect(() => {
    // Значения по умолчанию для нового сценария
    const defaultScenario: Partial<GameScenario> = {
      description: '',
      isScam: true,
      explanationForScam: '',
      explanationForNotScam: '',
      category: 'phishing', // Default category
    };
    // Глубокое копирование, чтобы избежать мутаций исходного объекта
    const initialData = initialScenario ? JSON.parse(JSON.stringify(initialScenario)) : {};
    setScenarioData({ ...defaultScenario, ...initialData });
  }, [initialScenario, show]);

  if (!show) return null;

  const handleFieldChange = (field: keyof GameScenario, value: any) => {
    setScenarioData(p => ({ ...p, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-start pt-10">
      <div className="relative mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-4 pb-4 border-b">
          <h3 className="text-xl font-semibold text-gray-900">
            {initialScenario ? 'Редактирование сценария' : 'Создание нового сценария'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircle className="h-6 w-6" /></button>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-4">
          <div>
            <label className="label">Категория</label>
            <select
              value={scenarioData.category || 'phishing'}
              onChange={e => handleFieldChange('category', e.target.value)}
              className="input"
            >
              {SCENARIO_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Описание ситуации (вопрос для игрока)</label>
            <textarea
              value={scenarioData.description || ''}
              onChange={e => handleFieldChange('description', e.target.value)}
              className="input"
              rows={5}
              placeholder="Например: Вам пришло SMS с ссылкой для получения выигрыша в лотерею, в которой вы не участвовали..."
            />
          </div>
          
          <div>
            <label className="label">Это мошенничество?</label>
            <select
              value={String(scenarioData.isScam)}
              onChange={e => handleFieldChange('isScam', e.target.value === 'true')}
              className="input"
            >
              <option value="true">Да, это мошенничество</option>
              <option value="false">Нет, это безопасно</option>
            </select>
          </div>

          <div>
            <label className="label">Объяснение, если игрок ответил "Да, мошенничество"</label>
            <textarea
              value={scenarioData.explanationForScam || ''}
              onChange={e => handleFieldChange('explanationForScam', e.target.value)}
              className="input"
              rows={4}
              placeholder="Например: Правильно! Незнакомые ссылки в SMS часто ведут на фишинговые сайты для кражи данных."
            />
          </div>

          <div>
            <label className="label">Объяснение, если игрок ответил "Нет, не мошенничество"</label>
            <textarea
              value={scenarioData.explanationForNotScam || ''}
              onChange={e => handleFieldChange('explanationForNotScam', e.target.value)}
              className="input"
              rows={4}
              placeholder="Например: Ошибка! Это классический пример фишинга. Никогда не переходите по таким ссылкам."
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
          <button onClick={onClose} className="btn-secondary">Отмена</button>
          <button onClick={() => onSave(scenarioData)} disabled={loading} className="btn-primary">
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
};


// --- ОСНОВНОЙ КОМПОНЕНТ СТРАНИЦЫ ---
export default function AdminGamesPage() {
  const {
    scenarios,
    loadScenarios,
    createScenario,
    updateScenario,
    deleteScenario,
    loading,
    error
  } = useGameAdmin();

  const [searchTerm, setSearchTerm] = useState("");
  const [isScamFilter, setIsScamFilter] = useState("all"); // "all", "true", "false"
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedScenario, setSelectedScenario] = useState<GameScenario | null>(null);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadScenarios();
  }, [loadScenarios]);

  const filteredScenarios = useMemo(() => scenarios.filter((scenario : GameScenario) => {
    const matchesSearch = scenario.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesScamFilter = isScamFilter === "all" || String(scenario.isScam) === isScamFilter;
    const matchesCategoryFilter = categoryFilter === "all" || scenario.category === categoryFilter;
    return matchesSearch && matchesScamFilter && matchesCategoryFilter;
  }), [scenarios, searchTerm, isScamFilter, categoryFilter]);

  const openCreate = () => {
    setSelectedScenario(null);
    setShowEditorModal(true);
  };

  const openEdit = (scenario: GameScenario) => {
    setSelectedScenario(scenario);
    setShowEditorModal(true);
  };

  const handleSaveScenario = async (scenarioData: Partial<GameScenario>) => {
    if (!scenarioData.description || !scenarioData.explanationForScam || !scenarioData.explanationForNotScam || !scenarioData.category) {
      alert("Пожалуйста, заполните все поля.");
      return;
    }

    if (selectedScenario && selectedScenario.id) {
      await updateScenario(selectedScenario.id, scenarioData);
    } else {
      // ID будет сгенерирован в `database.ts` через `addDoc`
      await createScenario(scenarioData as Omit<GameScenario, 'id'>);
    }
    setShowEditorModal(false);
    setSelectedScenario(null);
  };

  const handleDeleteScenario = async () => {
    if (!selectedScenario) return;
    await deleteScenario(selectedScenario.id);
    setShowDeleteModal(false);
    setSelectedScenario(null);
  };

  const getCategoryLabel = (value?: string) => {
    if (!value) return 'Общее';
    const category = SCENARIO_CATEGORIES.find(c => c.value === value);
    return category ? category.label : value;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Управление играми</h1>
            <p className="text-gray-600 mt-1">Создавайте и редактируйте сценарии для викторины "Мошенники или нет?".</p>
          </div>
          <div className="flex space-x-2">
            <button onClick={openCreate} className="btn-primary flex items-center">
              <Plus className="h-4 w-4 mr-2" /> Новый сценарий
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p className="font-bold">Ошибка</p>
            <p>{error}</p>
          </div>
        )}

        {loading && scenarios.length === 0 ? (
          <div className="text-center py-20">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary-600" />
            <p className="mt-4 text-gray-500">Загрузка сценариев...</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow mb-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Поиск по описанию..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={isScamFilter}
                  onChange={(e) => setIsScamFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">Все типы (Мошенничество)</option>
                  <option value="true">Мошенничество</option>
                  <option value="false">Не мошенничество</option>
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">Все категории</option>
                  {SCENARIO_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="th w-2/5">Описание ситуации</th>
                      <th className="th">Категория</th>
                      <th className="th">Правильный ответ</th>
                      <th className="th text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredScenarios.map((scenario : GameScenario) => (
                      <tr key={scenario.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-800 line-clamp-3">{scenario.description}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getCategoryLabel(scenario.category)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`badge ${scenario.isScam ? 'badge-red' : 'badge-green'}`}>
                            {scenario.isScam ? 'Мошенничество' : 'Безопасно'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-3">
                            <button onClick={() => openEdit(scenario)} className="text-gray-600 hover:text-gray-900"><Edit size={16} /></button>
                            <button onClick={() => { setSelectedScenario(scenario); setShowDeleteModal(true); }} className="text-red-600 hover:text-red-900"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredScenarios.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Gamepad2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Сценарии не найдены</h3>
                  <p className="text-gray-500">Попробуйте изменить параметры поиска или создайте новый сценарий.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <ScenarioEditorModal
        show={showEditorModal}
        onClose={() => setShowEditorModal(false)}
        onSave={handleSaveScenario}
        initialScenario={selectedScenario}
        loading={loading}
      />
      
      {showDeleteModal && selectedScenario && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center">
          <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Удалить сценарий</h3>
              <p className="text-sm text-gray-500 mt-2 px-4">
                {`Вы уверены, что хотите удалить этот сценарий? Действие необратимо.`}
              </p>
              <div className="items-center px-4 py-3 mt-4 space-x-4">
                <button onClick={() => setShowDeleteModal(false)} className="btn-secondary">Отмена</button>
                <button onClick={handleDeleteScenario} className="btn-danger">Удалить</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
