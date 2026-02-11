import express from 'express'
import cors from 'cors'

// Initialize database and seed data
import './db/seed.js'

import usersRouter from './routes/users.js'
import tasksRouter from './routes/tasks.js'
import progressRouter from './routes/progress.js'
import contactsRouter from './routes/contacts.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// API routes
app.use('/api/users', usersRouter)
app.use('/api/tasks', tasksRouter)
app.use('/api/progress', progressRouter)
app.use('/api/contacts', contactsRouter)

// Root: redirect to frontend (dev)
app.get('/', (req, res) => {
  res.redirect(302, 'http://localhost:5173')
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
