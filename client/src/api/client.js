const API_BASE = '/api'

let authUserId = null
export function setAuthUserId(id) {
  authUserId = id == null ? null : Number(id)
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  if (authUserId != null) {
    headers['X-User-Id'] = String(authUserId)
  }

  const config = {
    headers,
    ...options
  }

  const response = await fetch(url, config)
  
  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json()
        if (data && typeof data.error === 'string') message = data.error
      } else {
        const text = await response.text()
        if (text && text.length < 200) message = text
      }
    } catch (err) {
      console.error('Error parsing response:', err)
    }
    throw new Error(message)
  }

  if (response.status === 204) return null
  return response.json()
}

// Users API
export const usersApi = {
  enter: (data) => {
    const body = typeof data === 'string' ? { username: data, password: '' } : { username: data.username, password: data.password }
    return request('/users/enter', { method: 'POST', body: JSON.stringify(body) })
  },

  getById: (id) => request(`/users/${id}`),

  getAll: () => request('/users'),

  create: (payload) => request('/users', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  update: (id, payload) => request(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  }),

  delete: (id) => request(`/users/${id}`, { method: 'DELETE' }),

  updateStage: (id, stage) => request(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ current_stage: stage })
  })
}

// Tasks API
export const tasksApi = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams()
    if (params.stage) searchParams.set('stage', params.stage)
    if (params.category) searchParams.set('category', params.category)

    const query = searchParams.toString()
    return request(`/tasks${query ? `?${query}` : ''}`)
  },

  getById: (id) => request(`/tasks/${id}`),

  create: (payload) => request('/tasks', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  update: (id, payload) => request(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  }),

  delete: (id) => request(`/tasks/${id}`, { method: 'DELETE' })
}

// Progress API
export const progressApi = {
  getByUser: (userId) => request(`/progress/${userId}`),
  
  getStats: (userId) => request(`/progress/${userId}/stats`),
  
  toggle: (userId, taskId, completed) => request('/progress', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, task_id: taskId, completed })
  })
}

// Contacts API
export const contactsApi = {
  getAll: (area) => {
    const query = area ? `?area=${area}` : ''
    return request(`/contacts${query}`)
  },

  getById: (id) => request(`/contacts/${id}`),

  create: (payload) => request('/contacts', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  update: (id, payload) => request(`/contacts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  }),

  delete: (id) => request(`/contacts/${id}`, { method: 'DELETE' })
}
