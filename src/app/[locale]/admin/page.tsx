'use client';
import { useEffect } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { Users, MessageSquare, FolderOpen, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
  const { 
    users, 
    posts, 
    categories, 
    reports, 
    refreshData,
    loadingUsers,
    loadingPosts,
    loadingCategories,
    loadingReports
  } = useAdmin();

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const stats = [
    {
      name: 'Пользователи',
      value: users.length,
      icon: Users,
      color: 'bg-blue-500',
      loading: loadingUsers
    },
    {
      name: 'Посты',
      value: posts.length,
      icon: MessageSquare,
      color: 'bg-green-500',
      loading: loadingPosts
    },
    {
      name: 'Категории',
      value: categories.length,
      icon: FolderOpen,
      color: 'bg-purple-500',
      loading: loadingCategories
    },
    {
      name: 'Жалобы',
      value: reports.length,
      icon: AlertTriangle,
      color: 'bg-red-500',
      loading: loadingReports
    },
  ];

  const recentUsers = users.slice(-5).reverse();
  const recentPosts = posts.slice(-5).reverse();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#2D3748] font-mono">Админ панель</h1>
        <p className="text-[#718096] font-mono">Управление системой Digital Fortress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-6">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-md p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[#718096] font-mono">{stat.name}</p>
                <p className="text-2xl font-semibold text-[#2D3748] font-mono">
                  {stat.loading ? '...' : stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0]">
          <div className="px-6 py-4 border-b border-[#E2E8F0]">
            <h2 className="text-lg font-medium text-[#2D3748] font-mono">Последние пользователи</h2>
          </div>
          <div className="p-6">
            {loadingUsers ? (
              <div className="text-center text-[#718096] font-mono">Загрузка...</div>
            ) : recentUsers.length === 0 ? (
              <div className="text-center text-[#718096] font-mono">Нет пользователей</div>
            ) : (
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {user.displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#2D3748] truncate font-mono">
                        {user.displayName}
                      </p>
                      <p className="text-sm text-[#718096] truncate font-mono">{user.email}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Posts */}
        <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0]">
          <div className="px-6 py-4 border-b border-[#E2E8F0]">
            <h2 className="text-lg font-medium text-[#2D3748] font-mono">Последние посты</h2>
          </div>
          <div className="p-6">
            {loadingPosts ? (
              <div className="text-center text-[#718096] font-mono">Загрузка...</div>
            ) : recentPosts.length === 0 ? (
              <div className="text-center text-[#718096] font-mono">Нет постов</div>
            ) : (
              <div className="space-y-3">
                {recentPosts.map((post) => (
                  <div key={post.id} className="border-b border-[#E2E8F0] pb-3 last:border-b-0">
                    <p className="text-sm font-medium text-[#2D3748] truncate font-mono">
                      {post.title}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full font-mono ${
                        post.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        post.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        post.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {post.severity}
                      </span>
                      <span className="text-xs text-[#718096] font-mono">
                        {new Date(post.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
