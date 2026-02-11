import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useUserStore } from '../stores/userStore'
import { contactsApi } from '../api/client'
import {
  KeyIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  ChartBarIcon,
  CreditCardIcon,
  CircleStackIcon,
  BuildingOffice2Icon,
  HeartIcon,
  ClockIcon,
  EnvelopeIcon,
  ClipboardDocumentIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

const areaConfig = {
  access: { label: 'Доступы и учетные записи', icon: KeyIcon, color: 'bg-gray-100 text-primary' },
  security: { label: 'Информационная безопасность', icon: ShieldCheckIcon, color: 'bg-gray-100 text-primary' },
  training: { label: 'Обучение и методика', icon: AcademicCapIcon, color: 'bg-gray-100 text-primary' },
  monitoring: { label: 'Мониторинг и дежурства', icon: ChartBarIcon, color: 'bg-gray-100 text-primary' },
  acquiring: { label: 'Эквайринг и POS', icon: CreditCardIcon, color: 'bg-gray-100 text-primary' },
  operations: { label: 'Процессы и эскалации', icon: BuildingOffice2Icon, color: 'bg-gray-100 text-primary' },
  hr: { label: 'HR и адаптация', icon: HeartIcon, color: 'bg-gray-100 text-primary' }
}

function getMessageTemplates(area) {
  const templates = {
    access: 'Здравствуйте! Я новый сотрудник. Нужна помощь с доступами и учетными записями.',
    security: 'Здравствуйте! Я новый сотрудник. Подскажите, где пройти курс и тест по ИБ, и какие сроки?',
    training: 'Здравствуйте! Я новый сотрудник. У меня возник вопрос по обучению. Когда удобно обсудить?',
    monitoring: 'Здравствуйте! Я новый сотрудник. Хочу разобраться с мониторингом и регламентами дежурств.',
    acquiring: 'Здравствуйте! Я новый сотрудник. У меня есть вопрос по работе с эквайрингом и POS-инцидентами.',
    operations: 'Здравствуйте! Я новый сотрудник. Подскажите, пожалуйста, как правильно оформить больничный и кого нужно уведомить?',
    hr: 'Здравствуйте! Я новый сотрудник. У меня есть вопросы по адаптации. Когда удобно будет пообщаться?'
  }
  return templates[area] || 'Здравствуйте! Я новый сотрудник в команде. У меня есть вопрос.'
}

function ContactCard({ contact, isUserMentor = false }) {
  const [copied, setCopied] = useState(false)
  const config = areaConfig[contact.area] || areaConfig.operations
  const Icon = config.icon

  const handleCopyTemplate = () => {
    const template = getMessageTemplates(contact.area)
    navigator.clipboard.writeText(template)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={`card hover:shadow-md transition-shadow flex flex-col h-full ${
        isUserMentor ? 'ring-1 ring-primary ring-inset' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`p-3 rounded-xl ${config.color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-gray-900">{contact.name}</h3>
            {isUserMentor && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                Ваш наставник
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{contact.role}</p>
        </div>
      </div>

      {/* Responsibility */}
      <p className="text-sm text-gray-600 mb-4 flex-grow">{contact.responsibility}</p>

      {/* Working hours */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <ClockIcon className="w-4 h-4" />
        <span>{contact.working_hours}</span>
      </div>

      {/* Contact links and copy button - pushed to bottom */}
      <div className="mt-auto">
        <div className="flex flex-wrap gap-2 mb-4">
          {contact.telegram && (
            <a
              href={`https://t.me/${contact.telegram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:ring-2 hover:ring-primary hover:ring-offset-1 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.121.1.155.234.17.331.015.098.033.322.018.497z"/>
              </svg>
              Telegram
            </a>
          )}
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:ring-2 hover:ring-gray-400 hover:ring-offset-1 transition-all"
            >
              <EnvelopeIcon className="w-4 h-4" />
              Email
            </a>
          )}
        </div>

        {/* Copy template button */}
        <button
          onClick={handleCopyTemplate}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            copied
              ? 'bg-gray-200 text-gray-900'
              : 'bg-gray-100 text-gray-700 hover:ring-2 hover:ring-gray-300'
          }`}
        >
          {copied ? (
            <>
              <CheckIcon className="w-4 h-4" />
              Скопировано!
            </>
          ) : (
            <>
              <ClipboardDocumentIcon className="w-4 h-4" />
              Скопировать шаблон сообщения
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default function HelpPage() {
  const user = useUserStore((state) => state.user)
  const mentorId = user?.mentor_id ?? user?.mentorId

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => contactsApi.getAll()
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Order by priority: Максим, Анастасия, Илья, Мария, Ольга, Николай
  const priorityOrder = [
    'Максим Павлов',
    'Анастасия Морозова',
    'Илья Семёнов',
    'Мария Лебедева',
    'Ольга Данилова',
    'Николай Громов'
  ]
  const sortedContacts = [...contacts].sort((a, b) => {
    const ai = priorityOrder.indexOf(a.name)
    const bi = priorityOrder.indexOf(b.name)
    // If not in priority list, put at the end
    if (ai === -1 && bi === -1) return 0
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">К кому обратиться</h1>
        <p className="text-gray-500 mt-1">
          Справочник контактов по разным направлениям
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-gray-100 border border-gray-200 rounded-xl p-4">
        <p className="text-sm text-gray-900">
          Нажми на кнопку "Скопировать шаблон сообщения", чтобы получить готовый текст для обращения. 
          Шаблон подготовит готовый текст для обращения.
        </p>
      </div>

      {/* All contact cards in one grid: 3 columns on large screens */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sortedContacts.map((contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            isUserMentor={mentorId != null && String(contact.id) === String(mentorId)}
          />
        ))}
      </div>
    </div>
  )
}
