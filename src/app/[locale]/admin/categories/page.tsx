'use client';
import { useEffect, useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import CategoryModal from '@/components/admin/CategoryModal';
import type { ForumCategory } from '@/types/database';

export default function CategoriesPage() {
  const { categories, loadCategories, deleteCategory, loadingCategories } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ForumCategory | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(null);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setSelectedCategory(null);
    setModalMode('create');
  };

  const handleEdit = (category: ForumCategory) => {
    setSelectedCategory(category);
    setModalMode('edit');
  };

  const handleView = (category: ForumCategory) => {
    setSelectedCategory(category);
    setModalMode('view');
  };

  const handleDelete = async (category: ForumCategory) => {
    if (confirm(`Вы уверены, что хотите удалить категорию "${category.name}"?`)) {
      try {
        await deleteCategory(category.id);
      } catch (error) {
        alert('Ошибка при удалении категории');
      }
    }
  };

  const closeModal = () => {
    setSelectedCategory(null);
    setModalMode(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Управление категориями</h1>
          <p className="text-gray-600">Просмотр, создание и редактирование категорий форума</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Создать категорию</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Поиск по названию или описанию..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loadingCategories ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Загрузка категорий...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredCategories.map((category) => (
              <div key={category.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <div className="text-2xl">{category.icon}</div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleView(category)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="Просмотр"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-indigo-600 hover:text-indigo-900 p-1"
                      title="Редактировать"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(category)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Удалить"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {category.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {category.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    category.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {category.isActive ? 'Активна' : 'Неактивна'}
                  </span>
                  
                  <span className="text-xs text-gray-500">
                    {new Date(category.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {filteredCategories.length === 0 && !loadingCategories && (
          <div className="p-6 text-center text-gray-500">
            {searchTerm ? 'Категории не найдены' : 'Нет категорий'}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalMode && (
        <CategoryModal
          category={selectedCategory}
          mode={modalMode}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
