import { useState } from 'react'
import { useUserStore } from '../stores/userStore'
import {
  BellAlertIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  WrenchScrewdriverIcon,
  ArrowTrendingUpIcon,
  ClipboardDocumentCheckIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

const stages = [
  {
    id: 'intake',
    title: 'Прием сигнала',
    icon: BellAlertIcon,
    color: 'bg-primary',
    description: 'Начало работы с инцидентом: получение сигнала и анализ.',
    whatHappens: [
      'Сработка триггера мониторинга',
      'Поступление обращения в очередь ГМИС',
      'Входящий звонок',
      'Проверка содержания обращения или сигнала',
      'Определение типа: инцидент / консультация / потенциальный КИ',
    ],
    artifacts: [
      'Содержание обращения',
      'Сработавший триггер',
      'Предоставленные исходные данные'
    ],
    forNewbie: {
      gmis: 'Правильное фиксирование входящего сигнала и уточнение деталей.'
    }
  },
  {
    id: 'monitoring',
    title: 'Мониторинг',
    icon: ChartBarIcon,
    color: 'bg-primary',
    description: 'Подтверждение и оценка состояния систем по мониторингу.',
    whatHappens: [
      'Проверка триггеров и графиков в Zabbix',
      'Контроль хостов, модулей, терминалов, банкоматов',
      'Проверка наличия транзакций и регламентных процессов',
      'Сопоставление состояния систем с нормой',
      'Формирование первичного вывода'
    ],
    artifacts: [
      'Скриншоты мониторинга',
      'Зафиксированное состояние систем',
      'Краткий вывод по ситуации'
    ],
    forNewbie: {
      gmis: 'Анализ реального состояния систем и места сбоя, а не ориентирование только на триггеры.'
    }
  },
  {
    id: 'diagnostics',
    title: 'Диагностика',
    icon: MagnifyingGlassIcon,
    color: 'bg-primary',
    description: 'Поиск причины инцидента и выбор сценария дальнейших действий.',
    whatHappens: [
      'Сбор логов, метрик и дополнительной информации',
      'Проверка типовых сценариев и базы знаний',
      'Определение масштаба проблемы',
      'Согласование действий с ответственными',
      'Оценка возможности решения либо необходимости эскалации'
    ],
    artifacts: [
      'Результаты диагностики',
      'Согласованный план восстановления',
      'Перечень затронутых систем'
    ],
    forNewbie: {
      gmis: 'Пошаговая диагностика с фиксацией каждого действия, даже при отсутствии очевидного решения.'
    }
  },
  {
    id: 'resolution',
    title: 'Решение',
    icon: WrenchScrewdriverIcon,
    color: 'bg-primary',
    description: 'Выполнение действий по восстановлению работы сервисов в рамках регламентов.',
    whatHappens: [
      'Выполнение согласованных действий',
      'Контроль результата через мониторинг и транзакции',
      'Обновление информации в обращении'
    ],
    artifacts: [
      'Описание выполненных действий',
      'Контроль восстановления',
      'Актуальный статус обращения'
    ],
    forNewbie: {
      gmis: 'Применение согласованных действий и контроль результата через мониторинг.'
    }
  },
  {
    id: 'escalation',
    title: 'Эскалация',
    icon: ArrowTrendingUpIcon,
    color: 'bg-primary',
    description: 'Передача инцидента на следующий уровень или подключение смежных команд.',
    whatHappens: [
      'Принятие решения об эскалации',
      'Подготовка фактов, логов и хронологии',
      'Передача информации ответственным или МКИ',
      'Контроль реакции и сроков'
    ],
    artifacts: [
      'Карточка эскалации',
      'Собранные данные для анализа',
      'Согласованные действия и ответственные'
    ],
    forNewbie: {
      gmis: 'Эскалация инцидента с зафиксированными данными и проверенной информацией.'
    }
  },
  {
    id: 'closure',
    title: 'Закрытие',
    icon: ClipboardDocumentCheckIcon,
    color: 'bg-primary',
    description: 'Завершение работы с инцидентом и фиксация результата.',
    whatHappens: [
      'Проверка стабильности работы после восстановления',
      'Финальное заполнение обращения',
      'Фиксация причины и результата',
      'Обновление базы знаний или инструкций при необходимости'
    ],
    artifacts: [
      'Закрытое обращение',
      'Зафиксированная причина и решение',
      'Обновлённые материалы, база знаний'
    ],
    forNewbie: {
      gmis: 'Фиксация причины, действий и результата при закрытии, чтобы через время по обращению можно было восстановить всю картину.'
    }
  }
]


export default function ProcessPage() {
  const [activeStage, setActiveStage] = useState('intake')
  const user = useUserStore((state) => state.user)
  
  const currentStage = stages.find((s) => s.id === activeStage)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Как работает ГМИС</h1>
        <p className="text-gray-500 mt-1">
          Жизненный цикл инцидента от сигнала до закрытия
        </p>
      </div>

      {/* Timeline stepper */}
      <div className="card overflow-x-auto">
        <div className="flex items-center justify-between min-w-max py-4 px-2">
          {stages.map((stage, index) => {
            const Icon = stage.icon
            const isActive = stage.id === activeStage
            const isPast = stages.findIndex((s) => s.id === activeStage) > index
            
            return (
              <div key={stage.id} className="flex items-center">
                <button
                  onClick={() => setActiveStage(stage.id)}
                  className={`flex flex-col items-center transition-all ${
                    isActive ? 'scale-110' : 'hover:scale-105'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      isActive
                        ? stage.color + ' text-white shadow-lg'
                        : isPast
                        ? 'bg-gray-200 text-gray-700'
                        : 'bg-gray-100 text-gray-500 hover:ring-2 hover:ring-gray-300'
                    }`}
                  >
                    {isPast && !isActive ? (
                      <CheckIcon className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium ${
                      isActive ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {stage.title}
                  </span>
                </button>
                
                {index < stages.length - 1 && (
                  <div
                    className={`w-16 h-1 mx-2 rounded ${
                      isPast ? 'bg-gray-300' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Stage details */}
      {currentStage && (
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-stretch">
            {/* What happens */}
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${currentStage.color} text-white`}>
                  <currentStage.icon className="w-5 h-5" />
                </div>
                <h2 className="font-semibold text-gray-900">{currentStage.title}</h2>
              </div>
              <p className="text-gray-600 text-sm mb-4">{currentStage.description}</p>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Что происходит:</h3>
              <ul className="space-y-2">
                {currentStage.whatHappens.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Artifacts */}
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-4">Ключевые артефакты</h2>
              <div className="space-y-3">
                {currentStage.artifacts.map((artifact, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-8 h-8 min-w-[2rem] flex-shrink-0 rounded bg-white border border-gray-200 flex items-center justify-center text-sm font-medium text-gray-500">
                      {i + 1}
                    </div>
                    <span className="text-sm text-gray-700 min-w-0">{artifact}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* For newbie */}
          <div className="lg:self-start">
          <div className="card bg-gray-100 border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-2">
              Что важно для тебя
            </h2>
            <p className="text-sm text-gray-800">
              {currentStage.forNewbie.gmis}
            </p>
          </div>
          </div>
        </div>
      )}
    </div>
  )
}
