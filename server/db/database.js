import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const db = new Database(join(__dirname, 'onboarding.db'))

// Enable foreign keys
db.pragma('foreign_keys = ON')

// Create tables
db.exec(`
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    name TEXT,
    current_stage TEXT DEFAULT 'stage1',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Tasks table (stages: 1=Start, 2=Theory, 3=Practice; mentor_id -> contacts)
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK(category IN ('access', 'security', 'processes', 'training', 'practice', 'systems')),
    priority TEXT CHECK(priority IN ('must', 'should', 'nice')),
    time_estimate INTEGER,
    stage TEXT CHECK(stage IN ('stage1', 'stage2', 'stage3')),
    mentor_id INTEGER REFERENCES contacts(id)
  );

  -- User progress tracking
  CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    completed INTEGER DEFAULT 0,
    completed_at DATETIME,
    UNIQUE(user_id, task_id)
  );

  -- Contacts directory
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    responsibility TEXT NOT NULL,
    area TEXT NOT NULL,
    working_hours TEXT,
    telegram TEXT,
    email TEXT
  );
`)

// Migrate users table from old schema (role, team) to new (username) if needed
const tableInfo = db.prepare('PRAGMA table_info(users)').all()
const hasUsername = tableInfo.some((c) => c.name === 'username')
const hasRole = tableInfo.some((c) => c.name === 'role')
if (!hasUsername && hasRole) {
  db.pragma('foreign_keys = OFF')
  db.exec(`
    CREATE TABLE users_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      name TEXT,
      current_stage TEXT DEFAULT 'stage1',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    INSERT INTO users_new (id, username, name, current_stage, created_at)
    SELECT id, 'U' || printf('%08d', id), name, current_stage, created_at FROM users;
    DROP TABLE users;
    ALTER TABLE users_new RENAME TO users;
  `)
  db.pragma('foreign_keys = ON')
}

// Migrate tasks to new schema (stages 1-3, categories, mentor_id)
const taskColumns = db.prepare('PRAGMA table_info(tasks)').all()
const hasMentorId = taskColumns.some((c) => c.name === 'mentor_id')
if (!hasMentorId && taskColumns.length > 0) {
  db.pragma('foreign_keys = OFF')
  db.exec(`
    DROP TABLE IF EXISTS user_progress;
    DROP TABLE IF EXISTS tasks;
    CREATE TABLE tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT CHECK(category IN ('access', 'security', 'processes', 'training', 'practice', 'systems')),
      priority TEXT CHECK(priority IN ('must', 'should', 'nice')),
      time_estimate INTEGER,
      stage TEXT CHECK(stage IN ('stage1', 'stage2', 'stage3')),
      mentor_id INTEGER REFERENCES contacts(id)
    );
    CREATE TABLE user_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
      completed INTEGER DEFAULT 0,
      completed_at DATETIME,
      UNIQUE(user_id, task_id)
    );
  `)
  db.pragma('foreign_keys = ON')
}

// Add 'systems' category to tasks (recreate table to change CHECK)
const tasksTableSql = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='tasks'").get()
if (tasksTableSql?.sql && !tasksTableSql.sql.includes("'systems'")) {
  db.pragma('foreign_keys = OFF')
  db.exec(`
    CREATE TABLE tasks_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT CHECK(category IN ('access', 'security', 'processes', 'training', 'practice', 'systems')),
      priority TEXT CHECK(priority IN ('must', 'should', 'nice')),
      time_estimate INTEGER,
      stage TEXT CHECK(stage IN ('stage1', 'stage2', 'stage3')),
      mentor_id INTEGER REFERENCES contacts(id)
    );
    INSERT INTO tasks_new (id, title, description, category, priority, time_estimate, stage, mentor_id)
    SELECT id, title, description, category, priority, time_estimate, stage, mentor_id FROM tasks;
    CREATE TABLE user_progress_backup AS SELECT * FROM user_progress;
    DROP TABLE user_progress;
    DROP TABLE tasks;
    ALTER TABLE tasks_new RENAME TO tasks;
    CREATE TABLE user_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
      completed INTEGER DEFAULT 0,
      completed_at DATETIME,
      UNIQUE(user_id, task_id)
    );
    INSERT INTO user_progress SELECT * FROM user_progress_backup;
    DROP TABLE user_progress_backup;
  `)
  db.pragma('foreign_keys = ON')
}

// Remove role column from tasks if present
const taskColsForRole = db.prepare('PRAGMA table_info(tasks)').all()
const hasRoleInTasks = taskColsForRole.some((c) => c.name === 'role')
if (hasRoleInTasks) {
  db.pragma('foreign_keys = OFF')
  db.exec(`
    CREATE TABLE tasks_no_role (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT CHECK(category IN ('access', 'security', 'processes', 'training', 'practice', 'systems')),
      priority TEXT CHECK(priority IN ('must', 'should', 'nice')),
      time_estimate INTEGER,
      stage TEXT CHECK(stage IN ('stage1', 'stage2', 'stage3')),
      mentor_id INTEGER REFERENCES contacts(id)
    );
    INSERT INTO tasks_no_role (id, title, description, category, priority, time_estimate, stage, mentor_id)
    SELECT id, title, description, category, priority, time_estimate, stage, mentor_id FROM tasks;
    DROP TABLE tasks;
    ALTER TABLE tasks_no_role RENAME TO tasks;
  `)
  db.pragma('foreign_keys = ON')
}

// Ensure users.current_stage default is stage1
try {
  const userInfo = db.prepare('PRAGMA table_info(users)').all()
  if (userInfo.some((c) => c.name === 'current_stage')) {
    db.prepare("UPDATE users SET current_stage = 'stage1' WHERE current_stage = 'stage0' OR current_stage IS NULL").run()
  }
} catch (_) {}

// Add role column to users (user | admin) if missing
const userCols = db.prepare('PRAGMA table_info(users)').all()
const hasRoleCol = userCols.some((c) => c.name === 'role')
if (!hasRoleCol) {
  db.prepare("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'").run()
  db.prepare("UPDATE users SET role = 'user' WHERE role IS NULL").run()
}

// Add password columns if missing
const userCols2 = db.prepare('PRAGMA table_info(users)').all()
const hasPasswordHash = userCols2.some((c) => c.name === 'password_hash')
if (!hasPasswordHash) {
  db.prepare('ALTER TABLE users ADD COLUMN password_hash TEXT').run()
  db.prepare('ALTER TABLE users ADD COLUMN password_salt TEXT').run()
}

// Add mentor_id column to users if missing
const userCols3 = db.prepare('PRAGMA table_info(users)').all()
const hasMentorIdInUsers = userCols3.some((c) => c.name === 'mentor_id')
if (!hasMentorIdInUsers) {
  db.prepare('ALTER TABLE users ADD COLUMN mentor_id INTEGER REFERENCES contacts(id)').run()
}

// Add assignment_type to tasks: 'self' | 'mentor' | 'supervisor' (replaces mentor as task assignment concept)
const taskColsAssignment = db.prepare('PRAGMA table_info(tasks)').all()
const hasAssignmentType = taskColsAssignment.some((c) => c.name === 'assignment_type')
if (!hasAssignmentType) {
  db.prepare("ALTER TABLE tasks ADD COLUMN assignment_type TEXT DEFAULT 'self'").run()
  db.prepare("UPDATE tasks SET assignment_type = CASE WHEN mentor_id IS NOT NULL THEN 'mentor' ELSE 'self' END").run()
  db.prepare("UPDATE tasks SET assignment_type = 'self' WHERE assignment_type IS NULL OR assignment_type NOT IN ('self','mentor','supervisor')").run()
}

export default db
