import { Router } from 'express'
import db from '../db/database.js'
import { requireUser, requireAdmin } from '../middleware/auth.js'
import { hashPassword, verifyPassword } from '../lib/password.js'

const router = Router()
const USERNAME_REGEX = /^U\d{8}$/
const VALID_STAGES = ['stage1', 'stage2', 'stage3']
const VALID_ROLES = ['user', 'admin']

function sanitizeUser(u) {
  if (!u) return u
  const { password_hash, password_salt, ...rest } = u
  return rest
}

// Login by username and password (users are created by admin only)
router.post('/enter', (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Username is required' })
    }
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password is required' })
    }

    const normalized = username.trim().toUpperCase()
    if (!USERNAME_REGEX.test(normalized)) {
      return res.status(400).json({ error: 'Username must be in format U00000000 (U + 8 digits)' })
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(normalized)
    if (!user) {
      return res.status(401).json({ error: 'Invalid login or password' })
    }
    if (!user.password_hash || !user.password_salt) {
      return res.status(401).json({ error: 'Invalid login or password' })
    }
    if (!verifyPassword(password, user.password_salt, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid login or password' })
    }

    res.json(sanitizeUser(user))
  } catch (error) {
    console.error('Error entering:', error)
    const message = error.message || 'Failed to enter'
    res.status(500).json({ error: message })
  }
})

// List all users (admin only)
router.get('/', requireUser, requireAdmin, (req, res) => {
  try {
    const users = db.prepare('SELECT id, username, name, current_stage, role, mentor_id, created_at FROM users ORDER BY id').all()
    res.json(users)
  } catch (error) {
    console.error('Error listing users:', error)
    res.status(500).json({ error: 'Failed to list users' })
  }
})

// Create user (admin only); name and password set by admin
router.post('/', requireUser, requireAdmin, (req, res) => {
  try {
    const { username, name, password, role, current_stage, mentor_id } = req.body
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Username is required' })
    }
    if (!password || typeof password !== 'string' || !password.trim()) {
      return res.status(400).json({ error: 'Password is required' })
    }
    const normalized = username.trim().toUpperCase()
    if (!USERNAME_REGEX.test(normalized)) {
      return res.status(400).json({ error: 'Username must be in format U00000000 (U + 8 digits)' })
    }
    if (role && !VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' })
    }
    const stage = current_stage && VALID_STAGES.includes(current_stage) ? current_stage : 'stage1'
    const roleVal = role && VALID_ROLES.includes(role) ? role : 'user'
    const nameVal = typeof name === 'string' ? name.trim() || null : null
    
    let mentorIdVal = null
    if (mentor_id !== undefined && mentor_id !== null) {
      const mentorIdNum = Number(mentor_id)
      if (isNaN(mentorIdNum)) {
        return res.status(400).json({ error: 'Invalid mentor_id' })
      }
      const mentor = db.prepare('SELECT id FROM contacts WHERE id = ?').get(mentorIdNum)
      if (!mentor) {
        return res.status(400).json({ error: 'Mentor not found' })
      }
      mentorIdVal = mentorIdNum
    }

    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(normalized)
    if (existing) {
      return res.status(409).json({ error: 'Username already exists' })
    }

    const { hash, salt } = hashPassword(password.trim())
    const stmt = db.prepare(`
      INSERT INTO users (username, name, current_stage, role, mentor_id, password_hash, password_salt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    const result = stmt.run(normalized, nameVal, stage, roleVal, mentorIdVal, hash, salt)
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid)
    res.status(201).json(sanitizeUser(user))
  } catch (error) {
    console.error('Error creating user:', error)
    res.status(500).json({ error: 'Failed to create user' })
  }
})

// Get user by ID (no password fields)
router.get('/:id', (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(sanitizeUser(user))
  } catch (error) {
    console.error('Error getting user:', error)
    res.status(500).json({ error: 'Failed to get user' })
  }
})

// Update user (name, current_stage, role; password only if admin)
router.patch('/:id', requireUser, (req, res) => {
  try {
    const { name, current_stage, role, password, mentor_id } = req.body
    const id = Number(req.params.id)
    const isAdmin = req.user.role === 'admin'

    if (role !== undefined && !isAdmin) {
      return res.status(403).json({ error: 'Only admin can change role' })
    }
    if (req.user.id !== id && !isAdmin) {
      return res.status(403).json({ error: 'Can only update own profile' })
    }
    if (password !== undefined && !isAdmin) {
      return res.status(403).json({ error: 'Only admin can set password' })
    }
    if (mentor_id !== undefined && !isAdmin) {
      return res.status(403).json({ error: 'Only admin can set mentor' })
    }

    const validStages = ['stage1', 'stage2', 'stage3']
    if (current_stage && !validStages.includes(current_stage)) {
      return res.status(400).json({ error: 'Invalid stage' })
    }
    if (role !== undefined && !VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' })
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const updates = []
    const params = []
    if (typeof name === 'string') {
      updates.push('name = ?')
      params.push(name.trim() || null)
    }
    if (current_stage) {
      updates.push('current_stage = ?')
      params.push(current_stage)
    }
    if (role && isAdmin) {
      updates.push('role = ?')
      params.push(role)
    }
    if (mentor_id !== undefined && isAdmin) {
      if (mentor_id === null || mentor_id === '') {
        updates.push('mentor_id = ?')
        params.push(null)
      } else {
        const mentorIdNum = Number(mentor_id)
        if (isNaN(mentorIdNum)) {
          return res.status(400).json({ error: 'Invalid mentor_id' })
        }
        const mentor = db.prepare('SELECT id FROM contacts WHERE id = ?').get(mentorIdNum)
        if (!mentor) {
          return res.status(400).json({ error: 'Mentor not found' })
        }
        updates.push('mentor_id = ?')
        params.push(mentorIdNum)
      }
    }
    if (password !== undefined && typeof password === 'string' && password.trim() && isAdmin) {
      const { hash, salt } = hashPassword(password.trim())
      updates.push('password_hash = ?')
      params.push(hash)
      updates.push('password_salt = ?')
      params.push(salt)
    }
    if (updates.length) {
      params.push(id)
      db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params)
    }

    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(id)
    res.json(sanitizeUser(updated))
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({ error: 'Failed to update user' })
  }
})

// Delete user (admin only)
router.delete('/:id', requireUser, requireAdmin, (req, res) => {
  try {
    const id = Number(req.params.id)
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    db.prepare('DELETE FROM users WHERE id = ?').run(id)
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting user:', error)
    res.status(500).json({ error: 'Failed to delete user' })
  }
})

export default router
