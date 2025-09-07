'use client';
import { useState } from 'react';
import { Settings, Save, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'Digital Fortress',
    siteDescription: 'Защита от мошенничества и кибербезопасность',
    maxPostsPerPage: 20,
    allowRegistration: true,
    moderationEnabled: true,
    emailNotifications: true,
    autoLockOldPosts: false,
    autoLockDays: 30
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // In a real app, this would save to the database
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Настройки сохранены успешно');
    } catch (error) {
      alert('Ошибка при сохранении настроек');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm('Вы уверены, что хотите сбросить настройки к значениям по умолчанию?')) {
      setSettings({
        siteName: 'Digital Fortress',
        siteDescription: 'Защита от мошенничества и кибербезопасность',
        maxPostsPerPage: 20,
        allowRegistration: true,
        moderationEnabled: true,
        emailNotifications: true,
        autoLockOldPosts: false,
        autoLockDays: 30
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Настройки системы</h1>
          <p className="text-gray-600">Управление общими настройками платформы</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleReset}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
          >
            <RefreshCw size={20} />
            <span>Сбросить</span>
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
          >
            <Save size={20} />
            <span>{loading ? 'Сохранение...' : 'Сохранить'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Settings size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Общие настройки</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название сайта
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание сайта
              </label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Постов на странице
              </label>
              <input
                type="number"
                min="5"
                max="100"
                value={settings.maxPostsPerPage}
                onChange={(e) => setSettings({ ...settings, maxPostsPerPage: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* User Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Настройки пользователей</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Разрешить регистрацию
                </label>
                <p className="text-xs text-gray-500">
                  Позволить новым пользователям регистрироваться
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.allowRegistration}
                onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Модерация включена
                </label>
                <p className="text-xs text-gray-500">
                  Требовать одобрения постов модератором
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.moderationEnabled}
                onChange={(e) => setSettings({ ...settings, moderationEnabled: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email уведомления
                </label>
                <p className="text-xs text-gray-500">
                  Отправлять уведомления по email
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Content Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Настройки контента</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Автоблокировка старых постов
                </label>
                <p className="text-xs text-gray-500">
                  Автоматически блокировать старые посты
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoLockOldPosts}
                onChange={(e) => setSettings({ ...settings, autoLockOldPosts: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            {settings.autoLockOldPosts && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Дней до автоблокировки
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={settings.autoLockDays}
                  onChange={(e) => setSettings({ ...settings, autoLockDays: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Информация о системе</h2>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Версия:</span>
              <span className="font-mono">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Последнее обновление:</span>
              <span>{new Date().toLocaleDateString('ru-RU')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">База данных:</span>
              <span>Firestore</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Аутентификация:</span>
              <span>Firebase Auth</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
