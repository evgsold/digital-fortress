'use client';
import { useEffect, useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { Plus, Search, Edit, Trash2, Eye, Pin, Lock } from 'lucide-react';
import PostModal from '@/components/admin/PostModal';
import type { ForumPost } from '@/types/database';

export default function PostsPage() {
  const { posts, loadPosts, deletePost, loadingPosts } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('');
  const [filterScamType, setFilterScamType] = useState<string>('');

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = !filterSeverity || post.severity === filterSeverity;
    const matchesScamType = !filterScamType || post.scamType === filterScamType;
    
    return matchesSearch && matchesSeverity && matchesScamType;
  });

  const handleCreate = () => {
    setSelectedPost(null);
    setModalMode('create');
  };

  const handleEdit = (post: ForumPost) => {
    setSelectedPost(post);
    setModalMode('edit');
  };

  const handleView = (post: ForumPost) => {
    setSelectedPost(post);
    setModalMode('view');
  };

  const handleDelete = async (post: ForumPost) => {
    if (confirm(`Вы уверены, что хотите удалить пост "${post.title}"?`)) {
      try {
        await deletePost(post.id);
      } catch (error) {
        alert('Ошибка при удалении поста');
      }
    }
  };

  const closeModal = () => {
    setSelectedPost(null);
    setModalMode(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Управление постами</h1>
          <p className="text-gray-600">Просмотр, создание и редактирование постов форума</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Создать пост</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Поиск по заголовку или содержанию..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Все уровни серьезности</option>
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
            <option value="critical">Критический</option>
          </select>
          <select
            value={filterScamType}
            onChange={(e) => setFilterScamType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Все типы мошенничества</option>
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
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loadingPosts ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Загрузка постов...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Заголовок
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Серьезность
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Тип мошенничества
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статистика
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
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {post.isPinned && <Pin size={16} className="text-blue-500 mr-2" />}
                        {post.isLocked && <Lock size={16} className="text-gray-500 mr-2" />}
                        <div>
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {post.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {post.content.substring(0, 100)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(post.severity)}`}>
                        {post.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {post.scamType.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="space-y-1">
                        <div>👁 {post.viewCount}</div>
                        <div>💬 {post.commentCount}</div>
                        <div>👍 {post.upvotes} 👎 {post.downvotes}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        {post.isResolved && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Решено
                          </span>
                        )}
                        {post.isPinned && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            Закреплено
                          </span>
                        )}
                        {post.isLocked && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            Заблокировано
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleView(post)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Просмотр"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(post)}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          title="Редактировать"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(post)}
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
            {filteredPosts.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                {searchTerm || filterSeverity || filterScamType ? 'Посты не найдены' : 'Нет постов'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalMode && (
        <PostModal
          post={selectedPost}
          mode={modalMode}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
