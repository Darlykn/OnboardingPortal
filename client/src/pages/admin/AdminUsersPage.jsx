import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi, contactsApi } from '../../api/client'
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline'
import MentorSelect from '../../components/MentorSelect'
import StyledSelect from '../../components/StyledSelect'
import Modal from '../../components/Modal'

const STAGES = [
  { value: 'stage1', label: 'Этап 1' },
  { value: 'stage2', label: 'Этап 2' },
  { value: 'stage3', label: 'Этап 3' }
]
const ROLES = [
  { value: 'user', label: 'Пользователь' },
  { value: 'admin', label: 'Администратор' }
]

export default function AdminUsersPage() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ username: '', name: '', password: '', current_stage: 'stage1', role: 'user', mentor_id: '' })
  const [editPassword, setEditPassword] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: usersApi.getAll
  })

  const { data: contacts = [] } = useQuery({
    queryKey: ['admin', 'contacts'],
    queryFn: () => contactsApi.getAll()
  })

  const mentors = contacts.filter(c => c.role && c.role.toLowerCase().includes('наставник'))

  const createMutation = useMutation({
    mutationFn: (payload) => usersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      setShowAdd(false)
      setForm({ username: '', name: '', password: '', current_stage: 'stage1', role: 'user', mentor_id: '' })
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => usersApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      setEditing(null)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => usersApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
  })

  const openEdit = (u) => {
    setEditing(u.id)
    setForm({
      username: u.username,
      name: u.name || '',
      current_stage: u.current_stage || 'stage1',
      role: u.role || 'user',
      mentor_id: u.mentor_id || ''
    })
    setEditPassword('')
  }

  const closeEdit = () => {
    setEditing(null)
    setEditPassword('')
  }

  useEffect(() => {
    if (showAdd) {
      setForm({ username: '', name: '', password: '', current_stage: 'stage1', role: 'user', mentor_id: '' })
    }
  }, [showAdd])

  const submitEdit = (e) => {
    e.preventDefault()
    if (editing) {
      const payload = { name: form.name || undefined, current_stage: form.current_stage, role: form.role }
      if (form.mentor_id) {
        payload.mentor_id = Number(form.mentor_id)
      } else {
        payload.mentor_id = null
      }
      if (editPassword.trim()) payload.password = editPassword.trim()
      updateMutation.mutate({ id: editing, payload })
    }
  }

  const submitAdd = (e) => {
    e.preventDefault()
    const normalized = form.username.trim().toUpperCase()
    if (!/^U\d{8}$/.test(normalized) || !form.password.trim()) return
    const payload = {
      username: normalized,
      name: form.name || undefined,
      password: form.password.trim(),
      current_stage: form.current_stage,
      role: form.role
    }
    if (form.mentor_id) {
      payload.mentor_id = Number(form.mentor_id)
    }
    createMutation.mutate(payload)
  }

  if (isLoading) return <p className="text-gray-500">Загрузка...</p>

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Добавить
        </button>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Новый пользователь" maxWidth="max-w-lg">
        <form onSubmit={submitAdd} className="space-y-4" autoComplete="off">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Логин (U00000000)</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                className="input w-full min-w-0"
                placeholder="U00000000"
                autoComplete="off"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="input w-full min-w-0"
                placeholder="Имя сотрудника"
                autoComplete="off"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="input w-full min-w-0"
              placeholder="Пароль для входа"
              autoComplete="new-password"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Этап</label>
              <StyledSelect
                value={form.current_stage}
                onChange={(v) => setForm((f) => ({ ...f, current_stage: v }))}
                options={STAGES}
                className="w-full min-w-0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
              <StyledSelect
                value={form.role}
                onChange={(v) => setForm((f) => ({ ...f, role: v }))}
                options={ROLES}
                className="w-full min-w-0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Наставник</label>
            <MentorSelect
              value={form.mentor_id}
              onChange={(v) => setForm((f) => ({ ...f, mentor_id: v }))}
              mentors={mentors}
              placeholder="Не назначен"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
              Создать
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">
              Отмена
            </button>
          </div>
          {createMutation.isError && (
            <p className="text-red-600 text-sm">{createMutation.error.message}</p>
          )}
        </form>
      </Modal>

      <Modal open={!!editing} onClose={closeEdit} title="Изменить пользователя">
        <form onSubmit={submitEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="input w-full min-w-0"
                  placeholder="Имя сотрудника"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Этап</label>
                <StyledSelect
                  value={form.current_stage}
                  onChange={(v) => setForm((f) => ({ ...f, current_stage: v }))}
                  options={STAGES}
                  className="w-full min-w-0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
                <StyledSelect
                  value={form.role}
                  onChange={(v) => setForm((f) => ({ ...f, role: v }))}
                  options={ROLES}
                  className="w-full min-w-0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Наставник</label>
                <MentorSelect
                  value={form.mentor_id}
                  onChange={(v) => setForm((f) => ({ ...f, mentor_id: v }))}
                  mentors={mentors}
                  placeholder="Не назначен"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Новый пароль (оставьте пустым, чтобы не менять)</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="input w-full min-w-0"
                  placeholder="Новый пароль"
                  autoComplete="new-password"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary" disabled={updateMutation.isPending}>
                  Сохранить
                </button>
                <button type="button" onClick={closeEdit} className="btn-secondary">
                  Отмена
                </button>
              </div>
              {updateMutation.isError && (
                <p className="text-red-600 text-sm">{updateMutation.error.message}</p>
              )}
            </form>
      </Modal>

      <div className="card overflow-x-auto">
        <table className="w-full text-left table-fixed">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-2 pr-4 w-28">Логин</th>
              <th className="py-2 pr-4 min-w-[140px]">Имя</th>
              <th className="py-2 pr-4 w-24">Этап</th>
              <th className="py-2 pr-4 min-w-[120px]">Роль</th>
              <th className="py-2 pr-4 min-w-[140px]">Наставник</th>
              <th className="py-2 pr-4 w-24">Создан</th>
              <th className="py-2 w-24">Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const mentor = u.mentor_id ? contacts.find(c => c.id === u.mentor_id) : null
              return (
                <tr key={u.id} className="border-b border-gray-100">
                  <td className="py-2 pr-4 truncate">{u.username}</td>
                  <td className="py-2 pr-4 truncate" title={u.name || ''}>{u.name || '-'}</td>
                  <td className="py-2 pr-4">{STAGES.find((s) => s.value === u.current_stage)?.label || u.current_stage}</td>
                  <td className="py-2 pr-4 truncate" title={ROLES.find((r) => r.value === u.role)?.label || u.role}>
                    {ROLES.find((r) => r.value === u.role)?.label || u.role || 'user'}
                  </td>
                  <td className="py-2 pr-4 truncate" title={mentor ? `${mentor.name} - ${mentor.role}` : ''}>
                    {mentor ? mentor.name : '-'}
                  </td>
                  <td className="py-2 pr-4 text-gray-500 text-sm">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-2 flex gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(u)}
                      className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                      title="Изменить"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => window.confirm('Удалить пользователя?') && deleteMutation.mutate(u.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      title="Удалить"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
