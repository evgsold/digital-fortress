'use client';
import { useEffect, useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { Search, Edit, Trash2, Eye, MessageCircle, Reply } from 'lucide-react';
import CommentModal from '@/components/admin/CommentModal';
import type { ForumComment } from '@/types/database';

export default function CommentsPage() {
  const { comments, loadComments, deleteComment, loadingComments } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComment, setSelectedComment] = useState<ForumComment | null>(null);
  const [modalMode, setModalMode] = useState<'edit' | 'view' | null>(null);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const filteredComments = comments.filter(comment =>
    comment.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (comment: ForumComment) => {
    setSelectedComment(comment);
    setModalMode('edit');
  };

  const handleView = (comment: ForumComment) => {
    setSelectedComment(comment);
    setModalMode('view');
  };

  const handleDelete = async (comment: ForumComment) => {
    if (confirm('Вы уверены, что хотите удалить этот комментарий?')) {
      try {
        await deleteComment(comment.id);
      } catch (error) {
        alert('Ошибка при удалении комментария');
      }
    }
  };

  const closeModal = () => {
    setSelectedComment(null);
    setModalMode(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2D3748]">Управление комментариями</h1>
          <p className="text-[#718096]">Просмотр, редактирование и удаление комментариев</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#718096]" size={20} />
          <input
            type="text"
            placeholder="Поиск по содержанию комментария..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#4299E1] focus:border-transparent"
          />
        </div>
      </div>

      {/* Comments List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loadingComments ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4299E1] mx-auto"></div>
            <p className="mt-2 text-[#718096]">Загрузка комментариев...</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E2E8F0]">
            {filteredComments.map((comment) => (
              <div key={comment.id} className="p-6 hover:bg-[#F7FAFC]">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {comment.parentCommentId && (
                        <Reply size={16} className="text-[#718096]" />
                      )}
                      <span className="text-sm font-medium text-[#2D3748]">
                        Автор ID: {comment.authorId}
                      </span>
                      <span className="text-sm text-[#718096]">
                        {new Date(comment.createdAt).toLocaleString('ru-RU')}
                      </span>
                      {comment.isEdited && (
                        <span className="text-xs text-[#718096]">(отредактировано)</span>
                      )}
                      {comment.isModerator && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Модератор
                        </span>
                      )}
                      {comment.isHelpful && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Полезно
                        </span>
                      )}
                    </div>
                    
                    <div className="text-[#2D3748] mb-3">
                      {comment.content.length > 200 
                        ? `${comment.content.substring(0, 200)}...`
                        : comment.content
                      }
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-[#718096]">
                      <span>👍 {comment.upvotes}</span>
                      <span>👎 {comment.downvotes}</span>
                      <span>Post ID: {comment.postId}</span>
                      {comment.parentCommentId && (
                        <span>Ответ на: {comment.parentCommentId}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleView(comment)}
                      className="text-[#4299E1] hover:text-[#2B6CB0] p-1"
                      title="Просмотр"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEdit(comment)}
                      className="text-[#4299E1] hover:text-[#2B6CB0] p-1"
                      title="Редактировать"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(comment)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Удалить"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {filteredComments.length === 0 && !loadingComments && (
          <div className="p-6 text-center text-[#718096]">
            {searchTerm ? 'Комментарии не найдены' : 'Нет комментариев'}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalMode && (
        <CommentModal
          comment={selectedComment}
          mode={modalMode}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
