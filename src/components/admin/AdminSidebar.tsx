'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  MessageSquare, 
  FolderOpen, 
  MessageCircle, 
  AlertTriangle,
  BarChart3,
  Home,
  ChevronLeft,
  ChevronRight,
  Book,
  Gamepad
} from 'lucide-react';

const navigation = [
  { name: 'Дашборд', href: '/admin', icon: BarChart3 },
  { name: 'Пользователи', href: '/admin/users', icon: Users },
  { name: 'Категории', href: '/admin/categories', icon: FolderOpen },
  { name: 'Посты', href: '/admin/posts', icon: MessageSquare },
  { name: 'Комментарии', href: '/admin/comments', icon: MessageCircle },
  { name: 'Жалобы', href: '/admin/reports', icon: AlertTriangle },
  { name: 'Блог', href: '/admin/content', icon: Book },
  { name: 'Тесты', href: '/admin/tests', icon: Book },
  { name: 'Игры', href: '/admin/games', icon: Gamepad },
];

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className={`bg-gray-900 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <h1 className="text-xl font-bold">Админ панель</h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-800 transition-colors"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      
      <nav className="mt-8">
        <div className="px-4 mb-4">
          <Link
            href="/"
            className="flex items-center space-x-3 p-3 hover:bg-gray-800 transition-colors"
          >
            <Home size={20} />
            {!collapsed && <span>На главную</span>}
          </Link>
        </div>
        
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <item.icon size={20} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
