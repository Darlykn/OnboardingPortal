import { Outlet, NavLink } from 'react-router-dom'
import { UserGroupIcon, ClipboardDocumentListIcon, BookOpenIcon } from '@heroicons/react/24/outline'

const adminNav = [
  { path: '/admin/users', label: 'Пользователи', icon: UserGroupIcon },
  { path: '/admin/tasks', label: 'Задачи', icon: ClipboardDocumentListIcon },
  { path: '/admin/contacts', label: 'Контакты', icon: BookOpenIcon }
]

export default function AdminLayout() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Администрирование</h1>
      <nav className="flex gap-2 border-b border-gray-200">
        {adminNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-t-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white border border-b-0 border-gray-200 text-primary -mb-px'
                  : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-2" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}
