import db from './database.js'
import { hashPassword } from '../lib/password.js'

try {
  console.log('Starting database seeding...')
  
  // Seed contacts first (used by users.mentor_id and help page)
  const contactCount = db.prepare('SELECT COUNT(*) as count FROM contacts').get()
  console.log('Contacts count:', contactCount.count)
  
  if (contactCount.count === 0) {
    const insertContact = db.prepare(`
      INSERT INTO contacts (name, role, responsibility, area, working_hours, telegram, email)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    const contacts = [
      ['Максим Павлов', 'Ведущий специалист - наставник', 'Обучение, методика работы, контроль прогресса', 'training', '8:30-17:30', '@mpavlov_gmis', 'm.pavlov@ubrr.ru'],
      ['Анастасия Морозова', 'Главный специалист - наставник', 'Обучение, эскалации, сложные вопросы', 'training', '8:30-17:30', '@amorozova_gmis', 'a.morozova@ubrr.ru'],
      ['Илья Семёнов', 'Руководитель', 'Согласования и рабочие вопросы', 'operations', '8:30-17:30', '@isemenov_gmis', 'i.semenov@ubrr.ru'],
      ['Мария Лебедева', 'Администратор доступов', 'Карта доступа, учетные записи, OTRS', 'access', '8:30-17:30', '@mlebedeva_access', 'm.lebedeva@ubrr.ru'],
      ['Ольга Данилова', 'HR', 'Адаптация, вопросы по оформлению', 'hr', '8:30-17:30', '@odanilova_hr', 'o.danilova@ubrr.ru'],
      ['Николай Громов', 'Сопровождение эквайринга', 'Эквайринг, терминалы, инциденты POS', 'acquiring', '10:00-19:00', '@ngromov_acq', 'n.gromov@ubrr.ru']
    ]
    const insertContacts = db.transaction((list) => {
      for (const c of list) insertContact.run(...c)
    })
    insertContacts(contacts)
    console.log(`Inserted ${contacts.length} contacts`)
  }

  const taskCount = db.prepare('SELECT COUNT(*) as count FROM tasks').get()
  console.log('Tasks count:', taskCount.count)
  
  if (taskCount.count === 0) {
    console.log('Seeding tasks...')

    const insertTask = db.prepare(`
      INSERT INTO tasks (title, description, category, priority, time_estimate, stage, assignment_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    const withMentor = 'mentor'
    const self = 'self'

    const tasks = [
    // Stage 1 - Start (Этап 1)
    ['Фотографирование на пропуск', 'Запуск служебной записки в OTRS для изготовления пропуска', 'processes', 'must', 15, 'stage1', withMentor],
    ['Знакомство с рабочим местом и коллективом', 'Подготовить рабочее место, проверить периферию (клавиатура, мышь, мониторы, наушники)', 'processes', 'must', 30, 'stage1', withMentor],
    ['Вводный инструктаж по банку и регламентам', 'Рассказ о банке, графике работы и обедов, добавление в рабочие чаты', 'training', 'must', 30, 'stage1', withMentor],
    ['Инструктаж по пожарной безопасности', 'Пожарные выходы, ГДЗК, расположение огнетушителей', 'security', 'must', 30, 'stage1', withMentor],
    ['Инструктаж по информационной безопасности', 'Информация находится на внутреннем сайте', 'security', 'must', 40, 'stage1', self],
    ['Получение зарплатной карты', 'Подписать документы на получение зарплатной карты', 'processes', 'should', 20, 'stage1', self],
    ['Знакомство с пространством Confluence', 'Изучить инструкции и методику работы', 'systems', 'should', null, 'stage1', self],

    // Stage 2 - Theory (Этап 2)
    ['Получение базовых учетных записей', 'Проверить базовые доступы к учетным записям', 'access', 'must', 30, 'stage2', withMentor],
    ['Вход в Rocket.Chat', 'Добавление в рабочие чаты ГМИС', 'systems', 'must', 20, 'stage2', withMentor],
    ['Знакомство с учебным порталом', 'Проверка доступности курсов и тестов', 'systems', 'must', 20, 'stage2', self],
    ['Прохождение обязательных курсов и тестов', 'Прохождение курсов по информационной безопасности и охране труда на учебном портале', 'security', 'must', 90, 'stage2', self],
    ['Изучение методики и алгоритма работы ГМИС', 'Методика + инструкция по заполнению обращений', 'training', 'must', 60, 'stage2', self],
    ['Знакомство с сетевыми папками ГМИС', 'Структура общих папок: T:\\DATA\\Processing\\_Support, Common, Distrib, Y:\\HOME\\#OPPIS.', 'training', 'should', 25, 'stage2', self],
    ['Изучение внутреннего сайта', 'Навигация по разделам, поиск регламентов и инструкций', 'training', 'should', null, 'stage2', self],
    ['Получение полных доступов ГМИС', 'После согласования карты доступа', 'access', 'must', 30, 'stage2', withMentor],
    ['Знакомство с Flora (TWO)', 'Основные операции в TWO', 'systems', 'must', 45, 'stage2', withMentor],
    ['Знакомство с TMS (Igenico)', 'Работа с терминалами и инцидентами эквайринга', 'systems', 'must', 45, 'stage2', withMentor],
    ['Знакомство с TMS (Inpas)', 'Контроль статусов устройств и инцидентов', 'systems', 'must', 45, 'stage2', withMentor],
    ['Знакомство с GLPI', 'Карточки обращений, SLA, маршрутизация', 'systems', 'must', 40, 'stage2', withMentor],
    ['Наблюдение за решением обращений', 'Кейсы мониторинга и эквайринга', 'practice', 'must', 90, 'stage2', self],
    ['Знакомство с SAP Logon', 'Базовые сценарии мониторинга и сопровождения', 'systems', 'should', 40, 'stage2', self],
    ['Знакомство с SAP HCM', 'Навигация, поиск карточек', 'systems', 'should', 40, 'stage2', self],
    ['Знакомство с SAP CRM', 'Обращения, статусы, связка с эквайрингом', 'systems', 'should', 40, 'stage2', self],

    // Stage 3 - Practice (Этап 3)
    ['Повторение методики и алгоритма', 'Приоритизация и коммуникация с бизнесом', 'processes', 'must', 40, 'stage3', self],
    ['Инструкция по заполнению обращений', 'Закрытие задач, корректные статусы', 'processes', 'must', 30, 'stage3', self],
    ['Наблюдение за решением обращений', 'Сопровождение кейсов мониторинга', 'practice', 'must', 90, 'stage3', self],
    ['Решение простых обращений', 'POS, банкоматы, TXPG, интернет-банк, карты', 'practice', 'must', 120, 'stage3', self],
    ['Самостоятельная работа с типовыми обращениями', 'Консультации у наставника', 'practice', 'must', 180, 'stage3', withMentor],
    ['Обучение мониторингу банкоматов', 'Дежурства + регламент оповещения', 'training', 'must', 120, 'stage3', withMentor],
    ['Вход в Naumen и тестовый звонок', 'Проверка гарнитуры', 'systems', 'should', 20, 'stage3', withMentor],
    ['Повторные курсы и тесты на портале', 'Закончить выполнение всех курсов и тестов на учебном портале', 'training', 'should', 60, 'stage3', self],
    ['Обучение функционалу ночного дежурного', 'Ночной МКИ', 'training', 'should', 120, 'stage3', withMentor],
      ['Итоговое тестирование по ночному функционалу', 'Проверка знаний по эскалации и регламентным действиям', 'training', 'should', null, 'stage3', self]
    ]

    const insertMany = db.transaction((taskList) => {
      for (const task of taskList) {
        insertTask.run(...task)
      }
    })

    insertMany(tasks)
    console.log(`Inserted ${tasks.length} tasks`)
  }

  // Ensure default admin user exists (U00000001) with password
  const adminUsername = 'U00000001'
  const defaultAdminPassword = 'admin123'
  let adminUser = db.prepare('SELECT id, role, password_hash FROM users WHERE username = ?').get(adminUsername)
  if (!adminUser) {
    const { hash, salt } = hashPassword(defaultAdminPassword)
    db.prepare(`
      INSERT INTO users (username, name, current_stage, role, password_hash, password_salt)
      VALUES (?, 'Administrator', 'stage1', 'admin', ?, ?)
    `).run(adminUsername, hash, salt)
    console.log('Created default admin user:', adminUsername, '(password: ' + defaultAdminPassword + ')')
  } else {
    if (adminUser.role !== 'admin') {
      db.prepare('UPDATE users SET role = ? WHERE username = ?').run('admin', adminUsername)
      console.log('Set role admin for user:', adminUsername)
    }
    const withPassword = db.prepare('SELECT password_hash FROM users WHERE username = ?').get(adminUsername)
    if (!withPassword.password_hash) {
      const { hash, salt } = hashPassword(defaultAdminPassword)
      db.prepare('UPDATE users SET password_hash = ?, password_salt = ? WHERE username = ?').run(hash, salt, adminUsername)
      console.log('Set default password for admin:', adminUsername)
    }
  }

  // Two employees with different mentors (mentor_id -> contacts: 1 = Maxim Pavlov, 2 = Anastasia Morozova)
  const defaultUserPassword = 'user123'
  const employees = [
    { username: 'U00000002', name: 'Даниил Белов', mentor_id: 1 },
    { username: 'U00000003', name: 'Алексей Романов', mentor_id: 2 }
  ]
  for (const emp of employees) {
    let u = db.prepare('SELECT id, mentor_id FROM users WHERE username = ?').get(emp.username)
    if (!u) {
      const { hash, salt } = hashPassword(defaultUserPassword)
      db.prepare(`
        INSERT INTO users (username, name, current_stage, role, password_hash, password_salt, mentor_id)
        VALUES (?, ?, 'stage1', 'user', ?, ?, ?)
      `).run(emp.username, emp.name, hash, salt, emp.mentor_id)
      console.log('Created employee:', emp.username, emp.name, '(mentor_id:', emp.mentor_id + ', password: ' + defaultUserPassword + ')')
    } else if (u.mentor_id !== emp.mentor_id) {
      db.prepare('UPDATE users SET mentor_id = ? WHERE username = ?').run(emp.mentor_id, emp.username)
      console.log('Updated mentor for employee:', emp.username, '-> mentor_id', emp.mentor_id)
    }
  }

  console.log('Database seeded successfully!')
} catch (error) {
  console.error('Error seeding database:', error)
  throw error
}

export default db
