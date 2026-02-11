import { useState, useRef, useEffect } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

export default function StyledSelect({
  value,
  onChange,
  options = [],
  emptyOption = null,
  placeholder = '—',
  className = '',
  disabled
}) {
  const [open, setOpen] = useState(false)
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

  const selectedLabel = value === '' || value == null
    ? null
    : (options.find((o) => String(o.value) === String(value))?.label ?? String(value))

  const displayText = selectedLabel ?? (emptyOption !== null ? emptyOption : placeholder)

  const handleSelect = (val) => {
    onChange(val === '' ? '' : val)
    setOpen(false)
  }

  const showEmpty = emptyOption !== null

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className="styled-select-trigger w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left
          border border-gray-300 rounded-lg bg-white
          focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all
          hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selectedLabel ? 'text-gray-900' : 'text-gray-500'}>{displayText}</span>
        <ChevronDownIcon
          className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {open && (
        <div
          className="styled-select-dropdown absolute z-30 mt-1.5 w-full min-w-[160px] max-h-64 overflow-auto
            bg-white rounded-xl border border-gray-200 shadow-lg py-1.5"
          role="listbox"
        >
          {showEmpty && (
            <button
              type="button"
              role="option"
              aria-selected={value === '' || value == null}
              onClick={() => handleSelect('')}
              className={`w-full px-4 py-2.5 text-left transition-colors focus:outline-none
                ${(value === '' || value == null) ? 'bg-primary text-white hover:bg-primary/90' : 'hover:bg-gray-50 focus:bg-gray-50'}`}
            >
              <span className="font-medium">{emptyOption}</span>
            </button>
          )}
          {showEmpty && options.length > 0 && (
            <div className="border-t border-gray-100 my-1" aria-hidden />
          )}
          {options.map((opt) => {
            const isSelected = String(opt.value) === String(value)
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                className={`w-full px-4 py-2.5 text-left transition-colors focus:outline-none
                  ${isSelected ? 'bg-primary text-white hover:bg-primary/90' : 'hover:bg-gray-50 focus:bg-gray-50'}`}
              >
                <span className="font-medium">{opt.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
