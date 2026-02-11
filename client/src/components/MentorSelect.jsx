import { useState, useRef, useEffect } from 'react'
import { ChevronDownIcon, UserIcon } from '@heroicons/react/24/outline'

const EMPTY_VALUE = ''
const DROPDOWN_MAX_HEIGHT_PX = 256
const GAP = 12

export default function MentorSelect({ value, onChange, mentors = [], placeholder = 'Не назначен', className = '', disabled }) {
  const [open, setOpen] = useState(false)
  const [maxHeight, setMaxHeight] = useState(DROPDOWN_MAX_HEIGHT_PX)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  useEffect(() => {
    if (!open || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom - GAP
    setMaxHeight(Math.max(120, Math.min(DROPDOWN_MAX_HEIGHT_PX, spaceBelow)))
  }, [open])

  const selected = value === EMPTY_VALUE || !value
    ? null
    : mentors.find((m) => String(m.id) === String(value))

  const displayText = selected ? `${selected.name} - ${selected.role}` : placeholder

  const handleSelect = (id) => {
    onChange(id === EMPTY_VALUE ? '' : id)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className="mentor-select-trigger w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left
          border border-gray-300 rounded-lg bg-white
          focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all
          hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Выбор наставника"
      >
        <span className={selected ? 'text-gray-900' : 'text-gray-500'}>{displayText}</span>
        <ChevronDownIcon
          className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {open && (
        <div
          className="mentor-select-dropdown absolute z-30 top-full left-0 right-0 mt-1.5 w-full min-w-[280px]
            bg-white rounded-xl border border-gray-200 shadow-lg py-1.5 overflow-y-auto"
          style={{ maxHeight: `${maxHeight}px` }}
          role="listbox"
        >
          <button
            type="button"
            role="option"
            aria-selected={!selected}
            onClick={() => handleSelect(EMPTY_VALUE)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors focus:outline-none
              ${!selected ? 'bg-primary text-white hover:bg-primary/90' : 'hover:bg-gray-50 focus:bg-gray-50'}`}
          >
            <span className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${!selected ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
              <UserIcon className="w-5 h-5" />
            </span>
            <div>
              <span className="block font-medium">Не назначен</span>
              <span className={`block text-xs ${!selected ? 'text-white/80' : 'text-gray-500'}`}>Наставник не выбран</span>
            </div>
          </button>

          {mentors.length > 0 && (
            <div className="border-t border-gray-100 my-1" aria-hidden />
          )}

          {mentors.map((m) => {
            const isSelected = String(m.id) === String(value)
            return (
              <button
                key={m.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(m.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors focus:outline-none
                  ${isSelected ? 'bg-primary text-white hover:bg-primary/90' : 'hover:bg-gray-50 focus:bg-gray-50'}`}
              >
                <span className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 font-semibold text-sm
                  ${isSelected ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                  {m.name ? m.name.charAt(0).toUpperCase() : '?'}
                </span>
                <div className="min-w-0">
                  <span className="block font-medium truncate">{m.name}</span>
                  <span className={`block text-sm truncate ${isSelected ? 'text-white/90' : 'text-gray-500'}`}>{m.role}</span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
