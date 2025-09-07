'use client';
import { useState, useEffect } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { X } from 'lucide-react';
import type { ForumCategory } from '@/types/database';

interface CategoryModalProps {
  category: ForumCategory | null;
  mode: 'create' | 'edit' | 'view';
  onClose: () => void;
}

const commonIcons = ['📁', '🛡️', '⚠️', '🔒', '💰', '📧', '📱', '💻', '🌐', '❓'];
const commonColors = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6B7280'];

export default function CategoryModal({ category, mode, onClose }: CategoryModalProps) {
  const { createCategory, updateCategory } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: '📁',
    isActive: true
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description,
        color: category.color,
        icon: category.icon,
        isActive: category.isActive
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color: '#3B82F6',
        icon: '📁',
        isActive: true
      });
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view') return;

    setLoading(true);
    try {
      const now = new Date().toISOString();
      
      if (mode === 'create') {
        await createCategory({
          name: formData.name,
          description: formData.description,
          color: formData.color,
          icon: formData.icon,
          createdAt: now,
          updatedAt: now,
          isActive: formData.isActive
        });
      } else if (mode === 'edit' && category) {
        await updateCategory(category.id, {
          name: formData.name,
          description: formData.description,
          color: formData.color,
          icon: formData.icon,
          isActive: formData.isActive,
          updatedAt: now
        });
      }
      onClose();
    } catch (error) {
      alert('Ошибка при сохранении категории');
    } finally {
      setLoading(false);
    }
  };

  const isReadonly = mode === 'view';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <h2 className="text-xl font-semibold">
            {mode === 'create' && 'Создать категорию'}
            {mode === 'edit' && 'Редактировать категорию'}
            {mode === 'view' && 'Просмотр категории'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              readOnly={isReadonly}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Описание *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              readOnly={isReadonly}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Иконка
            </label>
            <div className="grid grid-cols-5 gap-2 mb-2">
              {commonIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => !isReadonly && setFormData({ ...formData, icon })}
                  className={`p-2 text-xl border rounded-md hover:bg-gray-50 ${
                    formData.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                  disabled={isReadonly}
                >
                  {icon}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Или введите свою иконку"
              readOnly={isReadonly}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Цвет
            </label>
            <div className="grid grid-cols-5 gap-2 mb-2">
              {commonColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => !isReadonly && setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  disabled={isReadonly}
                />
              ))}
            </div>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full h-10 border border-gray-300 rounded-md"
              disabled={isReadonly}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isReadonly}
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Активная категория
            </label>
          </div>

          {/* Preview */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Предварительный просмотр
            </label>
            <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: formData.color }}
              ></div>
              <div className="text-xl">{formData.icon}</div>
              <div>
                <div className="font-medium">{formData.name || 'Название категории'}</div>
                <div className="text-sm text-gray-600">{formData.description || 'Описание категории'}</div>
              </div>
            </div>
          </div>

          {category && mode === 'view' && (
            <div className="space-y-2 pt-4 border-t">
              <div className="text-sm">
                <span className="font-medium text-gray-700">ID:</span>
                <span className="ml-2 text-gray-600 font-mono">{category.id}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-700">Создано:</span>
                <span className="ml-2 text-gray-600">
                  {new Date(category.createdAt).toLocaleString('ru-RU')}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-700">Обновлено:</span>
                <span className="ml-2 text-gray-600">
                  {new Date(category.updatedAt).toLocaleString('ru-RU')}
                </span>
              </div>
            </div>
          )}

          {!isReadonly && (
            <div className="flex justify-end space-x-3 pt-6 border-t sticky bottom-0 bg-white">
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
