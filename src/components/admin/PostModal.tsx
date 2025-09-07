'use client';
import { useState, useEffect } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { X } from 'lucide-react';
import type { ForumPost } from '@/types/database';

interface PostModalProps {
  post: ForumPost | null;
  mode: 'create' | 'edit' | 'view';
  onClose: () => void;
}

export default function PostModal({ post, mode, onClose }: PostModalProps) {
  const { createPost, updatePost, categories, users } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    authorId: '',
    categoryId: '',
    scamType: 'other' as ForumPost['scamType'],
    severity: 'medium' as ForumPost['severity'],
    tags: [] as string[],
    isResolved: false,
    isPinned: false,
    isLocked: false
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        content: post.content,
        authorId: post.authorId,
        categoryId: post.categoryId,
        scamType: post.scamType,
        severity: post.severity,
        tags: post.tags,
        isResolved: post.isResolved,
        isPinned: post.isPinned,
        isLocked: post.isLocked
      });
    } else {
      setFormData({
        title: '',
        content: '',
        authorId: '',
        categoryId: '',
        scamType: 'other',
        severity: 'medium',
        tags: [],
        isResolved: false,
        isPinned: false,
        isLocked: false
      });
    }
  }, [post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view') return;

    setLoading(true);
    try {
      const now = new Date().toISOString();
      
      if (mode === 'create') {
        await createPost({
          title: formData.title,
          content: formData.content,
          authorId: formData.authorId,
          categoryId: formData.categoryId,
          scamType: formData.scamType,
          severity: formData.severity,
          tags: formData.tags,
          attachments: [],
          createdAt: now,
          updatedAt: now,
          isResolved: formData.isResolved,
          isPinned: formData.isPinned,
          isLocked: formData.isLocked,
          viewCount: 0,
          upvotes: 0,
          downvotes: 0,
          commentCount: 0,
          lastActivityAt: now
        });
      } else if (mode === 'edit' && post) {
        await updatePost(post.id, {
          title: formData.title,
          content: formData.content,
          categoryId: formData.categoryId,
          scamType: formData.scamType,
          severity: formData.severity,
          tags: formData.tags,
          isResolved: formData.isResolved,
          isPinned: formData.isPinned,
          isLocked: formData.isLocked,
          updatedAt: now
        });
      }
      onClose();
    } catch (error) {
      alert('Ошибка при сохранении поста');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const isReadonly = mode === 'view';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {mode === 'create' && 'Создать пост'}
            {mode === 'edit' && 'Редактировать пост'}
            {mode === 'view' && 'Просмотр поста'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Заголовок *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                readOnly={isReadonly}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Автор *
              </label>
              <select
                value={formData.authorId}
                onChange={(e) => setFormData({ ...formData, authorId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isReadonly || mode === 'edit'}
              >
                <option value="">Выберите автора</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.displayName} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Категория *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isReadonly}
              >
                <option value="">Выберите категорию</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Тип мошенничества
              </label>
              <select
                value={formData.scamType}
                onChange={(e) => setFormData({ ...formData, scamType: e.target.value as ForumPost['scamType'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isReadonly}
              >
                <option value="phishing">Фишинг</option>
                <option value="social_engineering">Социальная инженерия</option>
                <option value="fake_websites">Поддельные сайты</option>
                <option value="phone_scams">Телефонные мошенники</option>
                <option value="email_scams">Email мошенничество</option>
                <option value="investment_fraud">Инвестиционное мошенничество</option>
                <option value="romance_scams">Романтическое мошенничество</option>
                <option value="tech_support_scams">Поддельная тех. поддержка</option>
                <option value="cryptocurrency_scams">Криптовалютные мошенники</option>
                <option value="identity_theft">Кража личности</option>
                <option value="other">Другое</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Уровень серьезности
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value as ForumPost['severity'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isReadonly}
              >
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
                <option value="critical">Критический</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Содержание *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              readOnly={isReadonly}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Теги
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {tag}
                  {!isReadonly && (
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
            {!isReadonly && (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Добавить тег"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Добавить
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isResolved"
                checked={formData.isResolved}
                onChange={(e) => setFormData({ ...formData, isResolved: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isReadonly}
              />
              <label htmlFor="isResolved" className="ml-2 block text-sm text-gray-700">
                Решено
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPinned"
                checked={formData.isPinned}
                onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isReadonly}
              />
              <label htmlFor="isPinned" className="ml-2 block text-sm text-gray-700">
                Закреплено
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isLocked"
                checked={formData.isLocked}
                onChange={(e) => setFormData({ ...formData, isLocked: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isReadonly}
              />
              <label htmlFor="isLocked" className="ml-2 block text-sm text-gray-700">
                Заблокировано
              </label>
            </div>
          </div>

          {post && mode === 'view' && (
            <div className="space-y-2 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">ID:</span>
                  <span className="ml-2 text-gray-600 font-mono">{post.id}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Просмотры:</span>
                  <span className="ml-2 text-gray-600">{post.viewCount}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Комментарии:</span>
                  <span className="ml-2 text-gray-600">{post.commentCount}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Голоса:</span>
                  <span className="ml-2 text-gray-600">👍 {post.upvotes} 👎 {post.downvotes}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Создано:</span>
                  <span className="ml-2 text-gray-600">
                    {new Date(post.createdAt).toLocaleString('ru-RU')}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Обновлено:</span>
                  <span className="ml-2 text-gray-600">
                    {new Date(post.updatedAt).toLocaleString('ru-RU')}
                  </span>
                </div>
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
