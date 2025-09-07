'use client';
import { useState, useEffect } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { X } from 'lucide-react';
import type { ForumReport } from '@/types/database';

interface ReportModalProps {
  report: ForumReport | null;
  mode: 'edit' | 'view';
  onClose: () => void;
}

export default function ReportModal({ report, mode, onClose }: ReportModalProps) {
  const { updateReport } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: 'pending' as ForumReport['status'],
    moderatorNotes: ''
  });

  useEffect(() => {
    if (report) {
      setFormData({
        status: report.status,
        moderatorNotes: report.moderatorNotes || ''
      });
    }
  }, [report]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view' || !report) return;

    setLoading(true);
    try {
      const now = new Date().toISOString();
      await updateReport(report.id, {
        status: formData.status,
        moderatorNotes: formData.moderatorNotes,
        reviewedAt: now,
        reviewedBy: 'current_admin' // In a real app, this would be the current admin's ID
      });
      onClose();
    } catch (error) {
      alert('Ошибка при сохранении жалобы');
    } finally {
      setLoading(false);
    }
  };

  const getReasonText = (reason: string) => {
    const reasonMap: Record<string, string> = {
      'spam': 'Спам',
      'inappropriate_content': 'Неподходящий контент',
      'harassment': 'Домогательства',
      'misinformation': 'Дезинформация',
      'off_topic': 'Не по теме',
      'duplicate': 'Дубликат',
      'other': 'Другое'
    };
    return reasonMap[reason] || reason;
  };

  const isReadonly = mode === 'view';

  if (!report) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {mode === 'edit' && 'Обработать жалобу'}
            {mode === 'view' && 'Просмотр жалобы'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Причина жалобы
              </label>
              <input
                type="text"
                value={getReasonText(report.reason)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Тип цели
              </label>
              <input
                type="text"
                value={report.targetType === 'post' ? 'Пост' : 'Комментарий'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                readOnly
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Описание жалобы
            </label>
            <textarea
              value={report.description || 'Без описания'}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Статус *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as ForumReport['status'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isReadonly}
            >
              <option value="pending">В ожидании</option>
              <option value="reviewed">Рассмотрено</option>
              <option value="resolved">Решено</option>
              <option value="dismissed">Отклонено</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Заметки модератора
            </label>
            <textarea
              value={formData.moderatorNotes}
              onChange={(e) => setFormData({ ...formData, moderatorNotes: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Добавьте заметки о рассмотрении жалобы..."
              readOnly={isReadonly}
            />
          </div>

          <div className="space-y-2 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">ID жалобы:</span>
                <span className="ml-2 text-gray-600 font-mono">{report.id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">ID жалующегося:</span>
                <span className="ml-2 text-gray-600">{report.reporterId}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">ID цели:</span>
                <span className="ml-2 text-gray-600">{report.targetId}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Создано:</span>
                <span className="ml-2 text-gray-600">
                  {new Date(report.createdAt).toLocaleString('ru-RU')}
                </span>
              </div>
              {report.reviewedAt && (
                <>
                  <div>
                    <span className="font-medium text-gray-700">Рассмотрено:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(report.reviewedAt).toLocaleString('ru-RU')}
                    </span>
                  </div>
                  {report.reviewedBy && (
                    <div>
                      <span className="font-medium text-gray-700">Рассмотрел:</span>
                      <span className="ml-2 text-gray-600">{report.reviewedBy}</span>
                    </div>
                  )}
                </>
              )}
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
