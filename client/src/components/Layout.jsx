import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useUserStore } from '../stores/userStore'
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  MapIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

const navItems = [
  { path: '/dashboard', label: 'Главная', icon: HomeIcon },
  { path: '/checklist', label: 'Чек-лист', icon: ClipboardDocumentListIcon },
  { path: '/help', label: 'Контакты', icon: UserGroupIcon },
  { path: '/process', label: 'Процессы', icon: MapIcon },
]

const stageLabels = {
  stage1: 'Этап 1',
  stage2: 'Этап 2',
  stage3: 'Этап 3'
}

export default function Layout() {
  const user = useUserStore((state) => state.user)
  const clearUser = useUserStore((state) => state.clearUser)
  const navigate = useNavigate()

  const handleLogout = () => {
    clearUser()
    navigate('/setup')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <NavLink to="/dashboard" className="flex items-center">
                <img 
                  src="/logo0.png" 
                  alt="Onboarding Portal" 
                  className="h-10 w-auto"
                />
              </NavLink>
              <div className="hidden md:flex ml-10 space-x-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'text-primary ring-2 ring-primary ring-inset'
                          : 'text-gray-600 hover:ring-2 hover:ring-gray-300'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5 mr-2" />
                    {item.label}
                  </NavLink>
                ))}
                {user?.role === 'admin' && (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'text-primary ring-2 ring-primary ring-inset'
                          : 'text-gray-600 hover:ring-2 hover:ring-gray-300'
                      }`
                    }
                  >
                    <Cog6ToothIcon className="w-5 h-5 mr-2" />
                    Админ
                  </NavLink>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.name || user?.username}</p>
                <p className="text-xs text-gray-500">
                  {stageLabels[user?.currentStage] || user?.currentStage}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-gray-700 hover:ring-2 hover:ring-gray-200 rounded-lg transition-all"
                title="Выйти"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
        <div className="flex justify-around py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center px-3 py-2 text-xs font-medium ${
                  isActive ? 'text-primary' : 'text-gray-500'
                }`
              }
            >
              <item.icon className="w-6 h-6 mb-1" />
              {item.label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex flex-col items-center px-3 py-2 text-xs font-medium ${
                  isActive ? 'text-primary' : 'text-gray-500'
                }`
              }
            >
              <Cog6ToothIcon className="w-6 h-6 mb-1" />
              Админ
            </NavLink>
          )}
        </div>
      </nav>

      <main className="pt-20 pb-20 md:pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  )
}
