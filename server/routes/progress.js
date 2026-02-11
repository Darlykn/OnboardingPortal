import { Router } from 'express'
import db from '../db/database.js'

const router = Router()

// Get user's progress
router.get('/:userId', (req, res) => {
  try {
    const progress = db.prepare(`
      SELECT 
        up.id,
        up.user_id,
        up.task_id,
        up.completed,
        up.completed_at,
        t.title,
        t.category,
        t.priority,
        t.stage
      FROM user_progress up
      JOIN tasks t ON t.id = up.task_id
      WHERE up.user_id = ?
    `).all(req.params.userId)

    // Convert to a map for easier access on frontend
    const progressMap = {}
    progress.forEach(p => {
      progressMap[p.task_id] = {
        completed: Boolean(p.completed),
        completed_at: p.completed_at
      }
    })

    res.json(progressMap)
  } catch (error) {
    console.error('Error getting progress:', error)
    res.status(500).json({ error: 'Failed to get progress' })
  }
})

// Get progress stats for user
router.get('/:userId/stats', (req, res) => {
  try {
    const userId = req.params.userId

    // Get total tasks (all tasks, no role filter)
    const total = db.prepare('SELECT COUNT(*) as total FROM tasks').get().total

    // Get completed tasks count
    const completed = db.prepare(`
      SELECT COUNT(*) as completed 
      FROM user_progress 
      WHERE user_id = ? AND completed = 1
    `).get(userId).completed

    // Get stats by category
    const categoryStats = db.prepare(`
      SELECT 
        t.category,
        COUNT(*) as total,
        SUM(CASE WHEN up.completed = 1 THEN 1 ELSE 0 END) as completed
      FROM tasks t
      LEFT JOIN user_progress up ON t.id = up.task_id AND up.user_id = ?
      GROUP BY t.category
    `).all(userId)

    // Get stats by stage
    const stageStats = db.prepare(`
      SELECT 
        t.stage,
        COUNT(*) as total,
        SUM(CASE WHEN up.completed = 1 THEN 1 ELSE 0 END) as completed
      FROM tasks t
      LEFT JOIN user_progress up ON t.id = up.task_id AND up.user_id = ?
      GROUP BY t.stage
    `).all(userId)

    res.json({
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      byCategory: categoryStats,
      byStage: stageStats
    })
  } catch (error) {
    console.error('Error getting stats:', error)
    res.status(500).json({ error: 'Failed to get stats' })
  }
})

// Toggle task completion
router.post('/', (req, res) => {
  try {
    const { user_id, task_id, completed } = req.body

    if (!user_id || !task_id || completed === undefined) {
      return res.status(400).json({ error: 'user_id, task_id and completed are required' })
    }

    // Check if progress record exists
    const existing = db.prepare(`
      SELECT * FROM user_progress WHERE user_id = ? AND task_id = ?
    `).get(user_id, task_id)

    if (existing) {
      // Update existing record
      db.prepare(`
        UPDATE user_progress 
        SET completed = ?, completed_at = ?
        WHERE user_id = ? AND task_id = ?
      `).run(
        completed ? 1 : 0,
        completed ? new Date().toISOString() : null,
        user_id,
        task_id
      )
    } else {
      // Insert new record
      db.prepare(`
        INSERT INTO user_progress (user_id, task_id, completed, completed_at)
        VALUES (?, ?, ?, ?)
      `).run(
        user_id,
        task_id,
        completed ? 1 : 0,
        completed ? new Date().toISOString() : null
      )
    }

    res.json({ success: true, completed })
  } catch (error) {
    console.error('Error updating progress:', error)
    res.status(500).json({ error: 'Failed to update progress' })
  }
})

export default router
