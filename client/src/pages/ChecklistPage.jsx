import { useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { useUserStore } from '../stores/userStore'
import { useChecklistStore } from '../stores/checklistStore'
import { tasksApi, progressApi, usersApi } from '../api/client'
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid'

const stages = [
  { id: 'stage1', label: 'Этап 1. Начало' },
  { id: 'stage2', label: 'Этап 2. Теория' },
  { id: 'stage3', label: 'Этап 3. Практика' }
]

const categories = [
  { id: null, label: 'Все' },
  { id: 'security', label: 'Безопасность' },
  { id: 'processes', label: 'Процессы' },
  { id: 'access', label: 'Доступы' },
  { id: 'training', label: 'Обучение' },
  { id: 'systems', label: 'Системы' },
  { id: 'practice', label: 'Применение' }
]

const categoryColors = {
  access: 'bg-gray-100 text-primary',
  security: 'bg-gray-100 text-primary',
  processes: 'bg-gray-100 text-primary',
  training: 'bg-gray-100 text-primary',
  practice: 'bg-gray-100 text-primary',
  systems: 'bg-gray-100 text-primary'
}

const priorityLabels = {
  must: { label: 'Must', color: 'text-primary' },
  should: { label: 'Should', color: 'text-gray-700' },
  nice: { label: 'Nice', color: 'text-gray-600' }
}

export default function ChecklistPage() {
  const queryClient = useQueryClient()
  const user = useUserStore((state) => state.user)
  const updateStage = useUserStore((state) => state.updateStage)
  const { filters, setStageFilter, setCategoryFilter } = useChecklistStore()
  const [searchParams] = useSearchParams()

  const stageFromUrl = searchParams.get('stage')
  useEffect(() => {
    if (!stageFromUrl) return
    if (!stages.some((s) => s.id === stageFromUrl)) return
    if (filters.stage === stageFromUrl) return
    setStageFilter(stageFromUrl)
  }, [stageFromUrl, filters.stage, setStageFilter])

  // Fetch tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', filters.stage],
    queryFn: () => tasksApi.getAll({ stage: filters.stage }),
    enabled: !!user?.id
  })

  // Fetch user progress
  const { data: progress = {} } = useQuery({
    queryKey: ['progress', user?.id],
    queryFn: () => progressApi.getByUser(user.id),
    enabled: !!user?.id
  })

  // Toggle task mutation
  const toggleTask = useMutation({
    mutationFn: ({ taskId, completed }) => 
      progressApi.toggle(user.id, taskId, completed),
    onMutate: async ({ taskId, completed }) => {
      await queryClient.cancelQueries({ queryKey: ['progress', user?.id] })
      
      const previousProgress = queryClient.getQueryData(['progress', user?.id])
      
      queryClient.setQueryData(['progress', user?.id], (old) => ({
        ...old,
        [taskId]: { completed, completed_at: completed ? new Date().toISOString() : null }
      }))
      
      return { previousProgress }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['progress', user?.id], context.previousProgress)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['progress', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['progress-stats', user?.id] })
    }
  })

  // Filter tasks by category
  const filteredTasks = filters.category
    ? tasks.filter((t) => t.category === filters.category)
    : tasks

  const completedCount = filteredTasks.filter((t) => progress[t.id]?.completed).length

  const advancedFromStageRef = useRef(null)
  // Auto-advance to next stage when all tasks of current stage are completed
  useEffect(() => {
    if (!user?.id || tasks.length === 0) return
    const allCompleted = tasks.every((t) => progress[t.id]?.completed)
    if (!allCompleted) {
      advancedFromStageRef.current = null
      return
    }
    if (advancedFromStageRef.current === filters.stage) return
    const currentIndex = stages.findIndex((s) => s.id === filters.stage)
    const nextStage = stages[currentIndex + 1]
    if (!nextStage) return
    advancedFromStageRef.current = filters.stage
    usersApi.updateStage(user.id, nextStage.id).then(() => {
      updateStage(nextStage.id)
      // Do not switch tab: user stays on current stage list and can open next stage manually
    }).catch(() => {
      advancedFromStageRef.current = null
    })
  }, [user?.id, tasks, progress, filters.stage, updateStage])

  if (tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Чек-лист адаптации</h1>
        <p className="text-gray-500 mt-1">
          Выполни задачи, чтобы уверенно начать работу в ГМИС
        </p>
      </div>

      {/* Stage tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-1">
        {stages.map((stage) => (
          <button
            key={stage.id}
            onClick={() => setStageFilter(stage.id)}
            className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-all ${
              filters.stage === stage.id
                ? 'bg-white text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700 hover:ring-2 hover:ring-gray-200'
            }`}
          >
            {stage.label}
          </button>
        ))}
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id ?? 'all'}
            onClick={() => setCategoryFilter(cat.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              filters.category === cat.id
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:ring-2 hover:ring-gray-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Progress summary */}
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <CheckCircleIcon className="w-5 h-5 text-primary" />
        <span>
          Выполнено: {completedCount} из {filteredTasks.length}
        </span>
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="card text-center text-gray-500 py-12">
            Нет задач для выбранных фильтров
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = progress[task.id]?.completed
            return (
              <div
                key={task.id}
                className={`card flex items-start gap-4 transition-all hover:shadow-md ${
                  isCompleted ? 'bg-gray-50 opacity-75' : ''
                }`}
              >
                {/* Checkbox - only this is clickable */}
                <button
                  type="button"
                  onClick={() => toggleTask.mutate({ taskId: task.id, completed: !isCompleted })}
                  className="flex-shrink-0 mt-0.5 p-0 border-0 bg-transparent cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label={isCompleted ? 'Снять отметку выполнения' : 'Отметить выполненным'}
                >
                  {isCompleted ? (
                    <CheckCircleSolid className="w-6 h-6 text-primary" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 hover:ring-2 hover:ring-primary transition-all" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`font-medium ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                      {task.title}
                    </h3>
                    <span className={`flex-shrink-0 text-xs font-medium ${priorityLabels[task.priority].color}`}>
                      {priorityLabels[task.priority].label}
                    </span>
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColors[task.category]}`}>
                      {categories.find((c) => c.id === task.category)?.label}
                    </span>
                    {task.time_estimate != null && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <ClockIcon className="w-4 h-4" />
                        {task.time_estimate} мин
                      </span>
                    )}
                    {task.mentor_name && (
                      <span className="text-xs text-gray-500">
                        С наставником
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
