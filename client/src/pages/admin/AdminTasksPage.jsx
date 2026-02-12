import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '../../api/client'
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline'
import StyledSelect from '../../components/StyledSelect'
import Modal from '../../components/Modal'

const CATEGORIES = [
  { value: 'security', label: 'Безопасность' },
  { value: 'processes', label: 'Процессы' },
  { value: 'access', label: 'Доступы' },
  { value: 'training', label: 'Обучение' },
  { value: 'systems', label: 'Системы' },
  { value: 'practice', label: 'Практика' }
]
const PRIORITIES = [
  { value: 'must', label: 'Обязательно' },
  { value: 'should', label: 'Желательно' },
  { value: 'nice', label: 'По возможности' }
]
const STAGES = [
  { value: 'stage1', label: 'Этап 1' },
  { value: 'stage2', label: 'Этап 2' },
  { value: 'stage3', label: 'Этап 3' }
]

const ASSIGNMENT_OPTIONS = [
  { value: 'self', label: 'Самостоятельно' },
  { value: 'mentor', label: 'С наставником' },
  { value: 'supervisor', label: 'С руководителем' }
]

const emptyTask = {
  title: '',
  description: '',
  category: '',
  priority: 'must',
  time_estimate: '',
  stage: 'stage1',
  assignment_type: 'self'
}

export default function AdminTasksPage() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyTask)
  const [showAdd, setShowAdd] = useState(false)

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['admin', 'tasks'],
    queryFn: () => tasksApi.getAll()
  })

  const createMutation = useMutation({
    mutationFn: (payload) => tasksApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tasks'] })
      setShowAdd(false)
      setForm(emptyTask)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => tasksApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tasks'] })
      setEditing(null)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => tasksApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'tasks'] })
  })

  const openEdit = (t) => {
    setEditing(t.id)
    setForm({
      title: t.title || '',
      description: t.description || '',
      category: t.category || '',
      priority: t.priority || 'must',
      time_estimate: t.time_estimate ?? '',
      stage: t.stage || 'stage1',
      assignment_type: t.assignment_type || 'self'
    })
  }

  const toPayload = (f) => ({
    title: f.title.trim(),
    description: f.description?.trim() || null,
    category: f.category || null,
    priority: f.priority || null,
    time_estimate: f.time_estimate === '' ? null : Number(f.time_estimate),
    stage: f.stage || 'stage1',
    assignment_type: f.assignment_type || 'self'
  })

  const submitEdit = (e) => {
    e.preventDefault()
    if (editing) {
      updateMutation.mutate({ id: editing, payload: toPayload(form) })
    }
  }

  const submitAdd = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    createMutation.mutate(toPayload(form))
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

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Новая задача" maxWidth="max-w-xl">
        <form onSubmit={submitAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="input min-h-[80px]"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
              <StyledSelect
                value={form.category}
                onChange={(v) => setForm((f) => ({ ...f, category: v }))}
                options={CATEGORIES}
                emptyOption="—"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Приоритет</label>
              <StyledSelect
                value={form.priority}
                onChange={(v) => setForm((f) => ({ ...f, priority: v }))}
                options={PRIORITIES}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Этап</label>
              <StyledSelect
                value={form.stage}
                onChange={(v) => setForm((f) => ({ ...f, stage: v }))}
                options={STAGES}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Время (мин)</label>
              <input
                type="number"
                min={0}
                value={form.time_estimate}
                onChange={(e) => setForm((f) => ({ ...f, time_estimate: e.target.value }))}
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Выполнение</label>
            <StyledSelect
              value={form.assignment_type}
              onChange={(v) => setForm((f) => ({ ...f, assignment_type: v }))}
              options={ASSIGNMENT_OPTIONS}
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

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Изменить задачу" maxWidth="max-w-xl">
        <form onSubmit={submitEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="input w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="input min-h-[80px] w-full"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
              <StyledSelect
                value={form.category}
                onChange={(v) => setForm((f) => ({ ...f, category: v }))}
                options={CATEGORIES}
                emptyOption="—"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Приоритет</label>
              <StyledSelect
                value={form.priority}
                onChange={(v) => setForm((f) => ({ ...f, priority: v }))}
                options={PRIORITIES}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Этап</label>
              <StyledSelect
                value={form.stage}
                onChange={(v) => setForm((f) => ({ ...f, stage: v }))}
                options={STAGES}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Время (мин)</label>
              <input
                type="number"
                min={0}
                value={form.time_estimate}
                onChange={(e) => setForm((f) => ({ ...f, time_estimate: e.target.value }))}
                className="input w-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Выполнение</label>
            <StyledSelect
              value={form.assignment_type}
              onChange={(v) => setForm((f) => ({ ...f, assignment_type: v }))}
              options={ASSIGNMENT_OPTIONS}
            />
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
              <th className="py-2 pr-4">Название</th>
              <th className="py-2 pr-4">Категория</th>
              <th className="py-2 pr-4">Приоритет</th>
              <th className="py-2 pr-4">Этап</th>
              <th className="py-2 pr-4">Выполнение</th>
              <th className="py-2 pr-4">Мин</th>
              <th className="py-2">Действия</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} className="border-b border-gray-100">
                <td className="py-2 pr-4 max-w-[200px] truncate" title={t.title}>{t.title}</td>
                <td className="py-2 pr-4">{CATEGORIES.find((c) => c.value === t.category)?.label || t.category || '-'}</td>
                <td className="py-2 pr-4">{PRIORITIES.find((p) => p.value === t.priority)?.label || t.priority || '-'}</td>
                <td className="py-2 pr-4">{STAGES.find((s) => s.value === t.stage)?.label || t.stage || '-'}</td>
                <td className="py-2 pr-4">{t.assignment_label || '-'}</td>
                <td className="py-2 pr-4">{t.time_estimate ?? '-'}</td>
                <td className="py-2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(t)}
                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                    title="Изменить"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => window.confirm('Удалить задачу?') && deleteMutation.mutate(t.id)}
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
