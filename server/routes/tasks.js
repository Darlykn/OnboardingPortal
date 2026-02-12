import { Router } from 'express'
import db from '../db/database.js'
import { requireUser, requireAdmin } from '../middleware/auth.js'

const router = Router()
const VALID_CATEGORIES = ['access', 'security', 'processes', 'training', 'practice', 'systems']
const VALID_PRIORITIES = ['must', 'should', 'nice']
const VALID_STAGES = ['stage1', 'stage2', 'stage3']
const VALID_ASSIGNMENT_TYPES = ['self', 'mentor', 'supervisor']

const ASSIGNMENT_LABELS = { mentor: 'С наставником', supervisor: 'С руководителем' }

function formatTask(t) {
  const assignment_type = VALID_ASSIGNMENT_TYPES.includes(t.assignment_type) ? t.assignment_type : 'self'
  const assignment_label = ASSIGNMENT_LABELS[assignment_type] ?? null
  return { ...t, assignment_type, assignment_label }
}

// Get all tasks with optional filtering
router.get('/', (req, res) => {
  try {
    const { stage, category } = req.query

    let query = 'SELECT * FROM tasks WHERE 1=1'
    const params = []

    if (stage) {
      query += ' AND stage = ?'
      params.push(stage)
    }

    if (category) {
      query += ' AND category = ?'
      params.push(category)
    }

    query += ' ORDER BY priority ASC, id ASC'

    const rawTasks = db.prepare(query).all(...params)
    res.json(rawTasks.map(formatTask))
  } catch (error) {
    console.error('Error getting tasks:', error)
    res.status(500).json({ error: 'Failed to get tasks' })
  }
})

// Create task (admin only)
router.post('/', requireUser, requireAdmin, (req, res) => {
  try {
    const { title, description, category, priority, time_estimate, stage, assignment_type } = req.body
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Title is required' })
    }
    if (category && !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' })
    }
    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority' })
    }
    if (stage && !VALID_STAGES.includes(stage)) {
      return res.status(400).json({ error: 'Invalid stage' })
    }
    const timeEst = time_estimate != null ? Number(time_estimate) : null
    const at = VALID_ASSIGNMENT_TYPES.includes(assignment_type) ? assignment_type : 'self'

    const stmt = db.prepare(`
      INSERT INTO tasks (title, description, category, priority, time_estimate, stage, assignment_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    const result = stmt.run(
      title.trim(),
      typeof description === 'string' ? description.trim() || null : null,
      category || null,
      priority || null,
      timeEst,
      stage || 'stage1',
      at
    )
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid)
    res.status(201).json(formatTask(task))
  } catch (error) {
    console.error('Error creating task:', error)
    res.status(500).json({ error: 'Failed to create task' })
  }
})

// Get single task by ID
router.get('/:id', (req, res) => {
  try {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id)

    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }

    res.json(formatTask(task))
  } catch (error) {
    console.error('Error getting task:', error)
    res.status(500).json({ error: 'Failed to get task' })
  }
})

// Update task (admin only)
router.patch('/:id', requireUser, requireAdmin, (req, res) => {
  try {
    const id = Number(req.params.id)
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)
    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }

    const { title, description, category, priority, time_estimate, stage, assignment_type } = req.body
    if (category !== undefined && category !== null && !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' })
    }
    if (priority !== undefined && priority !== null && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority' })
    }
    if (stage !== undefined && stage !== null && !VALID_STAGES.includes(stage)) {
      return res.status(400).json({ error: 'Invalid stage' })
    }

    const updates = []
    const params = []
    if (typeof title === 'string') {
      updates.push('title = ?')
      params.push(title.trim())
    }
    if (description !== undefined) {
      updates.push('description = ?')
      params.push(typeof description === 'string' ? description.trim() || null : null)
    }
    if (category !== undefined) {
      updates.push('category = ?')
      params.push(category || null)
    }
    if (priority !== undefined) {
      updates.push('priority = ?')
      params.push(priority || null)
    }
    if (time_estimate !== undefined) {
      updates.push('time_estimate = ?')
      params.push(time_estimate != null ? Number(time_estimate) : null)
    }
    if (stage !== undefined) {
      updates.push('stage = ?')
      params.push(stage || null)
    }
    if (assignment_type !== undefined && VALID_ASSIGNMENT_TYPES.includes(assignment_type)) {
      updates.push('assignment_type = ?')
      params.push(assignment_type)
    }
    if (updates.length) {
      params.push(id)
      db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`).run(...params)
    }
    const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)
    res.json(formatTask(updated))
  } catch (error) {
    console.error('Error updating task:', error)
    res.status(500).json({ error: 'Failed to update task' })
  }
})

// Delete task (admin only)
router.delete('/:id', requireUser, requireAdmin, (req, res) => {
  try {
    const id = Number(req.params.id)
    const task = db.prepare('SELECT id FROM tasks WHERE id = ?').get(id)
    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }
    db.prepare('DELETE FROM tasks WHERE id = ?').run(id)
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting task:', error)
    res.status(500).json({ error: 'Failed to delete task' })
  }
})

export default router
