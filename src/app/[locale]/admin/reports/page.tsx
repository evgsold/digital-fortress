'use client';
import { useEffect, useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { Search, Edit, Trash2, Eye, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import ReportModal from '@/components/admin/ReportModal';
import type { ForumReport } from '@/types/database';

export default function ReportsPage() {
  const { reports, loadReports, deleteReport, loadingReports } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<ForumReport | null>(null);
  const [modalMode, setModalMode] = useState<'edit' | 'view' | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterReason, setFilterReason] = useState<string>('');

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || report.status === filterStatus;
    const matchesReason = !filterReason || report.reason === filterReason;
    
    return matchesSearch && matchesStatus && matchesReason;
  });

  const handleEdit = (report: ForumReport) => {
    setSelectedReport(report);
    setModalMode('edit');
  };

  const handleView = (report: ForumReport) => {
    setSelectedReport(report);
    setModalMode('view');
  };

  const handleDelete = async (report: ForumReport) => {
    if (confirm('Вы уверены, что хотите удалить эту жалобу?')) {
      try {
        await deleteReport(report.id);
      } catch (error) {
        alert('Ошибка при удалении жалобы');
      }
    }
  };

  const closeModal = () => {
    setSelectedReport(null);
    setModalMode(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertTriangle size={16} className="text-yellow-600" />;
      case 'reviewed': return <Eye size={16} className="text-blue-600" />;
      case 'resolved': return <CheckCircle size={16} className="text-green-600" />;
      case 'dismissed': return <XCircle size={16} className="text-red-600" />;
      default: return <AlertTriangle size={16} className="text-gray-600" />;
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Управление жалобами</h1>
          <p className="text-gray-600">Просмотр, обработка и управление жалобами пользователей</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Поиск по описанию или причине..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Все статусы</option>
            <option value="pending">В ожидании</option>
            <option value="reviewed">Рассмотрено</option>
            <option value="resolved">Решено</option>
            <option value="dismissed">Отклонено</option>
          </select>
          <select
            value={filterReason}
            onChange={(e) => setFilterReason(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Все причины</option>
            <option value="spam">Спам</option>
            <option value="inappropriate_content">Неподходящий контент</option>
            <option value="harassment">Домогательства</option>
            <option value="misinformation">Дезинформация</option>
            <option value="off_topic">Не по теме</option>
            <option value="duplicate">Дубликат</option>
            <option value="other">Другое</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loadingReports ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Загрузка жалоб...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Причина
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Описание
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Тип цели
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата создания
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getReasonText(report.reason)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {report.description || 'Без описания'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        report.targetType === 'post' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {report.targetType === 'post' ? 'Пост' : 'Комментарий'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(report.status)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                          {report.status === 'pending' && 'В ожидании'}
                          {report.status === 'reviewed' && 'Рассмотрено'}
                          {report.status === 'resolved' && 'Решено'}
                          {report.status === 'dismissed' && 'Отклонено'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleView(report)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Просмотр"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(report)}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          title="Редактировать"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(report)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Удалить"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredReports.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                {searchTerm || filterStatus || filterReason ? 'Жалобы не найдены' : 'Нет жалоб'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalMode && (
        <ReportModal
          report={selectedReport}
          mode={modalMode}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
