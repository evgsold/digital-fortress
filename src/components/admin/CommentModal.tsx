'use client';
import { useState, useEffect } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { X } from 'lucide-react';
import type { ForumComment } from '@/types/database';

interface CommentModalProps {
  comment: ForumComment | null;
  mode: 'edit' | 'view';
  onClose: () => void;
}

export default function CommentModal({ comment, mode, onClose }: CommentModalProps) {
  const { updateComment } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    isHelpful: false,
    isModerator: false
  });

  useEffect(() => {
    if (comment) {
      setFormData({
        content: comment.content,
        isHelpful: comment.isHelpful,
        isModerator: comment.isModerator
      });
    }
  }, [comment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view' || !comment) return;

    setLoading(true);
    try {
      await updateComment(comment.id, {
        content: formData.content,
        isHelpful: formData.isHelpful,
        isModerator: formData.isModerator,
        updatedAt: new Date().toISOString(),
        isEdited: true
      });
      onClose();
    } catch (error) {
      alert('Ошибка при сохранении комментария');
    } finally {
      setLoading(false);
    }
  };

  const isReadonly = mode === 'view';

  if (!comment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {mode === 'edit' && 'Редактировать комментарий'}
            {mode === 'view' && 'Просмотр комментария'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Содержание *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              readOnly={isReadonly}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isHelpful"
                checked={formData.isHelpful}
                onChange={(e) => setFormData({ ...formData, isHelpful: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isReadonly}
              />
              <label htmlFor="isHelpful" className="ml-2 block text-sm text-gray-700">
                Полезный комментарий
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isModerator"
                checked={formData.isModerator}
                onChange={(e) => setFormData({ ...formData, isModerator: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isReadonly}
              />
              <label htmlFor="isModerator" className="ml-2 block text-sm text-gray-700">
                Комментарий модератора
              </label>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">ID:</span>
                <span className="ml-2 text-gray-600 font-mono">{comment.id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Автор ID:</span>
                <span className="ml-2 text-gray-600">{comment.authorId}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Пост ID:</span>
                <span className="ml-2 text-gray-600">{comment.postId}</span>
              </div>
              {comment.parentCommentId && (
                <div>
                  <span className="font-medium text-gray-700">Ответ на:</span>
                  <span className="ml-2 text-gray-600">{comment.parentCommentId}</span>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-700">Голоса:</span>
                <span className="ml-2 text-gray-600">👍 {comment.upvotes} 👎 {comment.downvotes}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Статус:</span>
                <span className="ml-2 text-gray-600">
                  {comment.isEdited ? 'Отредактировано' : 'Оригинал'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Создано:</span>
                <span className="ml-2 text-gray-600">
                  {new Date(comment.createdAt).toLocaleString('ru-RU')}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Обновлено:</span>
                <span className="ml-2 text-gray-600">
                  {new Date(comment.updatedAt).toLocaleString('ru-RU')}
                </span>
              </div>
            </div>
          </div>

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
