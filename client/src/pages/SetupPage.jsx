import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useUserStore } from '../stores/userStore'
import { usersApi } from '../api/client'
import { UserIcon, LockClosedIcon } from '@heroicons/react/24/outline'

const USERNAME_REGEX = /^U\d{8}$/

export default function SetupPage() {
  const navigate = useNavigate()
  const setUser = useUserStore((state) => state.setUser)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const enterMutation = useMutation({
    mutationFn: (data) => usersApi.enter(data),
    onSuccess: (data) => {
      setUser(data)
      navigate('/dashboard')
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const normalized = username.trim().toUpperCase()
    if (USERNAME_REGEX.test(normalized) && password) {
      enterMutation.mutate({ username: normalized, password })
    }
  }

  const normalized = username.trim().toUpperCase()
  const isValid = USERNAME_REGEX.test(normalized)

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Добро пожаловать в команду
          </h1>
          <p className="text-gray-600">
            Введите логин и пароль
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Логин
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input pl-10"
                placeholder="U00000000"
                autoComplete="username"
                autoCapitalize="characters"
              />
            </div>
            {username.trim() && !isValid && (
              <p className="text-gray-700 text-sm mt-1">
                Формат: латинская U и 8 цифр (например U00037278)
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Пароль
            </label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-10"
                placeholder="Пароль"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!isValid || !password.trim() || enterMutation.isPending}
            className="w-full btn-primary py-3 text-lg"
          >
            {enterMutation.isPending ? 'Вход...' : 'Войти'}
          </button>

          {enterMutation.isError && (
            <p className="text-primary text-sm text-center">
              Ошибка: {enterMutation.error.message}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
