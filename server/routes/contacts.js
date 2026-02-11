import { Router } from 'express'
import db from '../db/database.js'
import { requireUser, requireAdmin } from '../middleware/auth.js'

const router = Router()

// Get all contacts
router.get('/', (req, res) => {
  try {
    const { area } = req.query

    let query = 'SELECT * FROM contacts'
    const params = []

    if (area) {
      query += ' WHERE area = ?'
      params.push(area)
    }

    query += ' ORDER BY area, name'

    const contacts = db.prepare(query).all(...params)

    res.json(contacts)
  } catch (error) {
    console.error('Error getting contacts:', error)
    res.status(500).json({ error: 'Failed to get contacts' })
  }
})

// Create contact (admin only)
router.post('/', requireUser, requireAdmin, (req, res) => {
  try {
    const { name, role, responsibility, area, working_hours, telegram, email } = req.body
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' })
    }
    if (!role || typeof role !== 'string' || !role.trim()) {
      return res.status(400).json({ error: 'Role is required' })
    }
    if (!responsibility || typeof responsibility !== 'string' || !responsibility.trim()) {
      return res.status(400).json({ error: 'Responsibility is required' })
    }
    if (!area || typeof area !== 'string' || !area.trim()) {
      return res.status(400).json({ error: 'Area is required' })
    }

    const stmt = db.prepare(`
      INSERT INTO contacts (name, role, responsibility, area, working_hours, telegram, email)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    const result = stmt.run(
      name.trim(),
      role.trim(),
      responsibility.trim(),
      area.trim(),
      typeof working_hours === 'string' ? working_hours.trim() || null : null,
      typeof telegram === 'string' ? telegram.trim() || null : null,
      typeof email === 'string' ? email.trim() || null : null
    )
    const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(result.lastInsertRowid)
    res.status(201).json(contact)
  } catch (error) {
    console.error('Error creating contact:', error)
    res.status(500).json({ error: 'Failed to create contact' })
  }
})

// Get single contact by ID
router.get('/:id', (req, res) => {
  try {
    const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id)

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' })
    }

    res.json(contact)
  } catch (error) {
    console.error('Error getting contact:', error)
    res.status(500).json({ error: 'Failed to get contact' })
  }
})

// Update contact (admin only)
router.patch('/:id', requireUser, requireAdmin, (req, res) => {
  try {
    const id = Number(req.params.id)
    const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(id)
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' })
    }

    const { name, role, responsibility, area, working_hours, telegram, email } = req.body
    const updates = []
    const params = []
    if (typeof name === 'string') {
      updates.push('name = ?')
      params.push(name.trim() || contact.name)
    }
    if (typeof role === 'string') {
      updates.push('role = ?')
      params.push(role.trim() || contact.role)
    }
    if (typeof responsibility === 'string') {
      updates.push('responsibility = ?')
      params.push(responsibility.trim() || contact.responsibility)
    }
    if (typeof area === 'string') {
      updates.push('area = ?')
      params.push(area.trim() || contact.area)
    }
    if (working_hours !== undefined) {
      updates.push('working_hours = ?')
      params.push(typeof working_hours === 'string' ? working_hours.trim() || null : null)
    }
    if (telegram !== undefined) {
      updates.push('telegram = ?')
      params.push(typeof telegram === 'string' ? telegram.trim() || null : null)
    }
    if (email !== undefined) {
      updates.push('email = ?')
      params.push(typeof email === 'string' ? email.trim() || null : null)
    }
    if (updates.length) {
      params.push(id)
      db.prepare(`UPDATE contacts SET ${updates.join(', ')} WHERE id = ?`).run(...params)
    }
    const updated = db.prepare('SELECT * FROM contacts WHERE id = ?').get(id)
    res.json(updated)
  } catch (error) {
    console.error('Error updating contact:', error)
    res.status(500).json({ error: 'Failed to update contact' })
  }
})

// Delete contact (admin only); clear mentor_id in tasks and users first
router.delete('/:id', requireUser, requireAdmin, (req, res) => {
  try {
    const id = Number(req.params.id)
    const contact = db.prepare('SELECT id FROM contacts WHERE id = ?').get(id)
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' })
    }
    db.prepare('UPDATE tasks SET mentor_id = NULL WHERE mentor_id = ?').run(id)
    db.prepare('UPDATE users SET mentor_id = NULL WHERE mentor_id = ?').run(id)
    db.prepare('DELETE FROM contacts WHERE id = ?').run(id)
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting contact:', error)
    res.status(500).json({ error: 'Failed to delete contact' })
  }
})

export default router
