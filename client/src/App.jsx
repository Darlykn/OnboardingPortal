import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useUserStore } from './stores/userStore'
import { setAuthUserId } from './api/client'
import Layout from './components/Layout'
import SetupPage from './pages/SetupPage'
import DashboardPage from './pages/DashboardPage'
import ChecklistPage from './pages/ChecklistPage'
import HelpPage from './pages/HelpPage'
import ProcessPage from './pages/ProcessPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminTasksPage from './pages/admin/AdminTasksPage'
import AdminContactsPage from './pages/admin/AdminContactsPage'

function ProtectedRoute({ children }) {
  const user = useUserStore((state) => state.user)

  if (!user) {
    return <Navigate to="/setup" replace />
  }

  return children
}

function AdminRoute({ children }) {
  const user = useUserStore((state) => state.user)
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

function App() {
  const user = useUserStore((state) => state.user)
  useEffect(() => {
    setAuthUserId(user?.id ?? null)
  }, [user?.id])

  return (
    <Routes>
      <Route path="/setup" element={<SetupPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="checklist" element={<ChecklistPage />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="process" element={<ProcessPage />} />
        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to="/admin/users" replace />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="tasks" element={<AdminTasksPage />} />
          <Route path="contacts" element={<AdminContactsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
