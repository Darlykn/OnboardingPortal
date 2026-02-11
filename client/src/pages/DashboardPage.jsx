import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useUserStore } from '../stores/userStore'
import { progressApi, contactsApi } from '../api/client'
import {
  CheckCircleIcon,
  ClockIcon,
  UserCircleIcon,
  BookOpenIcon,
  AcademicCapIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

const CONFLUENCE_TRAINING_URL = 'https://confluence.example.com/training'
const UBIRA_TRAINING_URL = 'https://www.lan.ubrr.ru/'
const INTERNAL_SITE_URL = 'http://www.lan.ubrr.ru/'

const stageLabels = {
  stage1: 'Этап 1. Начало',
  stage2: 'Этап 2. Теория',
  stage3: 'Этап 3. Практика'
}

const categoryLabels = {
  access: 'Доступы',
  security: 'Безопасность',
  processes: 'Процессы',
  training: 'Обучение',
  practice: 'Применение',
  systems: 'Системы'
}

const categoryColors = {
  access: 'bg-gray-100 text-primary',
  security: 'bg-gray-100 text-primary',
  processes: 'bg-gray-100 text-primary',
  training: 'bg-gray-100 text-primary',
  practice: 'bg-gray-100 text-primary',
  systems: 'bg-gray-100 text-primary'
}

const categoryOrder = ['security', 'processes', 'access', 'training', 'systems', 'practice']

export default function DashboardPage() {
  const user = useUserStore((state) => state.user)
  const mentorId = user?.mentor_id ?? user?.mentorId

  const { data: stats, isLoading } = useQuery({
    queryKey: ['progress-stats', user?.id],
    queryFn: () => progressApi.getStats(user.id),
    enabled: !!user?.id
  })

  const { data: mentor } = useQuery({
    queryKey: ['contact', mentorId],
    queryFn: () => contactsApi.getById(mentorId),
    enabled: !!mentorId
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="card bg-primary text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Привет, {user?.name || user?.username}!</h1>
            <p className="text-white/90">
              {stageLabels[user?.currentStage]}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 text-right">
            <div className="text-3xl font-bold">{stats?.percentage || 0}%</div>
            <div className="text-white/90 text-sm">выполнено</div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Общий прогресс</h2>
          <span className="text-sm text-gray-500">
            {stats?.completed || 0} из {stats?.total || 0} задач
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-primary h-3 rounded-full transition-all duration-500"
            style={{ width: `${stats?.percentage || 0}%` }}
          ></div>
        </div>
      </div>

      {/* Stats by category */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Прогресс по категориям</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[...(stats?.byCategory || [])]
            .sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category))
            .map((cat) => (
            <div key={cat.category} className="p-3 rounded-lg bg-gray-50">
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-2 ${categoryColors[cat.category]}`}>
                {categoryLabels[cat.category]}
              </span>
              <div className="flex items-center gap-2">
                {cat.completed === cat.total ? (
                  <CheckCircleIcon className="w-5 h-5 text-primary" />
                ) : (
                  <ClockIcon className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-sm font-medium">
                  {cat.completed || 0}/{cat.total}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats by stage */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Прогресс по этапам</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats?.byStage?.map((stage) => {
            const percentage = stage.total > 0 ? Math.round(((stage.completed || 0) / stage.total) * 100) : 0
            return (
              <Link
                key={stage.stage}
                to={`/checklist?stage=${encodeURIComponent(stage.stage)}`}
                className="p-4 rounded-lg border border-gray-200 hover:shadow-md hover:ring-2 hover:ring-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label={`Открыть чек-лист: ${stageLabels[stage.stage]}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{stageLabels[stage.stage]}</span>
                  <span className="text-sm text-gray-500">{stage.completed || 0}/{stage.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all bg-primary"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Quick access: mentor, Confluence, Ubira, Internal site */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-4">Быстрый доступ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Mentor card */}
          <Link
            to="/help"
            className="card hover:shadow-md hover:ring-2 hover:ring-gray-200 transition-all flex items-center gap-4"
            aria-label="Открыть контакты"
          >
            <div className="p-3 rounded-lg bg-gray-100">
              <UserCircleIcon className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900">Ваш наставник</p>
              {mentor ? (
                <>
                  <p className="text-sm text-gray-700 truncate" title={mentor.name}>{mentor.name}</p>
                </>
              ) : (
                <p className="text-sm text-gray-500">Не назначен</p>
              )}
            </div>
          </Link>

          {/* Confluence training portal */}
          <a
            href={CONFLUENCE_TRAINING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="card hover:shadow-md hover:ring-2 hover:ring-gray-200 transition-all flex items-center gap-4"
          >
            <div className="p-3 rounded-lg bg-gray-100">
              <BookOpenIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Портал Confluence</p>
              <p className="text-sm text-gray-500">Инструкции и методики</p>
            </div>
          </a>

          {/* Ubira training portal */}
          <a
            href={UBIRA_TRAINING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="card hover:shadow-md hover:ring-2 hover:ring-gray-200 transition-all flex items-center gap-4"
          >
            <div className="p-3 rounded-lg bg-gray-100">
              <AcademicCapIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Учебный портал</p>
              <p className="text-sm text-gray-500">Курсы и тесты</p>
            </div>
          </a>

          {/* Internal site */}
          <a
            href={INTERNAL_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="card hover:shadow-md hover:ring-2 hover:ring-gray-200 transition-all flex items-center gap-4"
          >
            <div className="p-3 rounded-lg bg-gray-100">
              <GlobeAltIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Внутренний сайт</p>
              <p className="text-sm text-gray-500">Регламенты и навигация</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
