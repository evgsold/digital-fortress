'use client';
import { useState, useEffect } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { X } from 'lucide-react';
import type { User } from '@/types/database';

interface UserModalProps {
  user: User | null;
  mode: 'create' | 'edit' | 'view';
  onClose: () => void;
}

export default function UserModal({ user, mode, onClose }: UserModalProps) {
  const { createUser, updateUser } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    email: '',
    displayName: '',
    role: 'user' as 'admin' | 'user',
    settings: {
      language: 'ru',
      notifications: true
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        settings: user.settings
      });
    } else {
      setFormData({
        id: '',
        email: '',
        displayName: '',
        role: 'user',
        settings: {
          language: 'ru',
          notifications: true
        }
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view') return;

    setLoading(true);
    try {
      if (mode === 'create') {
        const userId = formData.id || `user_${Date.now()}`;
        await createUser(userId, {
          email: formData.email,
          displayName: formData.displayName,
          role: formData.role,
          createdAt: new Date().toISOString(),
          avatarUrl: '',
          avatarStoragePath: '',
          settings: formData.settings
        });
      } else if (mode === 'edit' && user) {
        await updateUser(user.id, {
          email: formData.email,
          displayName: formData.displayName,
          role: formData.role,
          settings: formData.settings
        });
      }
      onClose();
    } catch (error) {
      alert('Ошибка при сохранении пользователя');
    } finally {
      setLoading(false);
    }
  };

  const isReadonly = mode === 'view';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {mode === 'create' && 'Создать пользователя'}
            {mode === 'edit' && 'Редактировать пользователя'}
            {mode === 'view' && 'Просмотр пользователя'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'create' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID пользователя
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Оставьте пустым для автогенерации"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              readOnly={isReadonly}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Отображаемое имя *
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              readOnly={isReadonly}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Роль
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isReadonly}
            >
              <option value="user">Пользователь</option>
              <option value="admin">Администратор</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Язык
            </label>
            <select
              value={formData.settings.language}
              onChange={(e) => setFormData({ 
                ...formData, 
                settings: { ...formData.settings, language: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isReadonly}
            >
              <option value="ru">Русский</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="notifications"
              checked={formData.settings.notifications}
              onChange={(e) => setFormData({ 
                ...formData, 
                settings: { ...formData.settings, notifications: e.target.checked }
              })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isReadonly}
            />
            <label htmlFor="notifications" className="ml-2 block text-sm text-gray-700">
              Уведомления
            </label>
          </div>

          {user && mode === 'view' && (
            <div className="space-y-2 pt-4 border-t">
              <div className="text-sm">
                <span className="font-medium text-gray-700">Дата создания:</span>
                <span className="ml-2 text-gray-600">
                  {new Date(user.createdAt).toLocaleString('ru-RU')}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-700">ID:</span>
                <span className="ml-2 text-gray-600 font-mono">{user.id}</span>
              </div>
            </div>
          )}

          {!isReadonly && (
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
