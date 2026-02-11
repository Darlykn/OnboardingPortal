import db from '../db/database.js'

export function requireUser(req, res, next) {
  const userId = req.headers['x-user-id']
  if (!userId) {
    return res.status(401).json({ error: 'X-User-Id header required' })
  }
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(userId))
  if (!user) {
    return res.status(401).json({ error: 'User not found' })
  }
  req.user = user
  next()
}

export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}
