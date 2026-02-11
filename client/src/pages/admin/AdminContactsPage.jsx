import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contactsApi } from '../../api/client'
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline'
import Modal from '../../components/Modal'

const emptyContact = {
  name: '',
  role: '',
  responsibility: '',
  area: '',
  working_hours: '',
  telegram: '',
  email: ''
}

export default function AdminContactsPage() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyContact)
  const [showAdd, setShowAdd] = useState(false)

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['admin', 'contacts'],
    queryFn: () => contactsApi.getAll()
  })

  const createMutation = useMutation({
    mutationFn: (payload) => contactsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'contacts'] })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      setShowAdd(false)
      setForm(emptyContact)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => contactsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'contacts'] })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      setEditing(null)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => contactsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'contacts'] })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    }
  })

  const openEdit = (c) => {
    setEditing(c.id)
    setForm({
      name: c.name || '',
      role: c.role || '',
      responsibility: c.responsibility || '',
      area: c.area || '',
      working_hours: c.working_hours || '',
      telegram: c.telegram || '',
      email: c.email || ''
    })
  }

  const submitEdit = (e) => {
    e.preventDefault()
    if (editing) {
      updateMutation.mutate({
        id: editing,
        payload: {
          name: form.name.trim(),
          role: form.role.trim(),
          responsibility: form.responsibility.trim(),
          area: form.area.trim(),
          working_hours: form.working_hours?.trim() || null,
          telegram: form.telegram?.trim() || null,
          email: form.email?.trim() || null
        }
      })
    }
  }

  const submitAdd = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.role.trim() || !form.responsibility.trim() || !form.area.trim()) return
    createMutation.mutate({
      name: form.name.trim(),
      role: form.role.trim(),
      responsibility: form.responsibility.trim(),
      area: form.area.trim(),
      working_hours: form.working_hours?.trim() || null,
      telegram: form.telegram?.trim() || null,
      email: form.email?.trim() || null
    })
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

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Новый контакт" maxWidth="max-w-xl">
        <form onSubmit={submitAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="input"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Обязанности</label>
            <input
              type="text"
              value={form.responsibility}
              onChange={(e) => setForm((f) => ({ ...f, responsibility: e.target.value }))}
              className="input"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Область</label>
              <input
                type="text"
                value={form.area}
                onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Часы работы</label>
              <input
                type="text"
                value={form.working_hours}
                onChange={(e) => setForm((f) => ({ ...f, working_hours: e.target.value }))}
                className="input"
                placeholder="09:00-18:00"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telegram</label>
              <input
                type="text"
                value={form.telegram}
                onChange={(e) => setForm((f) => ({ ...f, telegram: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="input"
              />
            </div>
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

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Изменить контакт" maxWidth="max-w-xl">
        <form onSubmit={submitEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="input w-full"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Обязанности</label>
            <input
              type="text"
              value={form.responsibility}
              onChange={(e) => setForm((f) => ({ ...f, responsibility: e.target.value }))}
              className="input w-full"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Область</label>
              <input
                type="text"
                value={form.area}
                onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Часы работы</label>
              <input
                type="text"
                value={form.working_hours}
                onChange={(e) => setForm((f) => ({ ...f, working_hours: e.target.value }))}
                className="input w-full"
                placeholder="09:00-18:00"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telegram</label>
              <input
                type="text"
                value={form.telegram}
                onChange={(e) => setForm((f) => ({ ...f, telegram: e.target.value }))}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="input w-full"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary" disabled={updateMutation.isPending}>
              Сохранить
            </button>
            <button type="button" onClick={() => setEditing(null)} className="btn-secondary">
              Отмена
            </button>
          </div>
          {updateMutation.isError && (
            <p className="text-red-600 text-sm">{updateMutation.error.message}</p>
          )}
        </form>
      </Modal>

      <div className="card overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-2 pr-4">Имя</th>
              <th className="py-2 pr-4">Роль</th>
              <th className="py-2 pr-4">Область</th>
              <th className="py-2 pr-4">Часы</th>
              <th className="py-2 pr-4">Telegram</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2">Действия</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id} className="border-b border-gray-100">
                <td className="py-2 pr-4">{c.name}</td>
                <td className="py-2 pr-4 max-w-[120px] truncate" title={c.role}>{c.role}</td>
                <td className="py-2 pr-4">{c.area}</td>
                <td className="py-2 pr-4">{c.working_hours || '-'}</td>
                <td className="py-2 pr-4">{c.telegram || '-'}</td>
                <td className="py-2 pr-4 max-w-[140px] truncate" title={c.email}>{c.email || '-'}</td>
                <td className="py-2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(c)}
                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                    title="Изменить"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => window.confirm('Удалить контакт?') && deleteMutation.mutate(c.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    title="Удалить"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
