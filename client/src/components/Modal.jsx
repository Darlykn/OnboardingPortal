import { XMarkIcon } from '@heroicons/react/24/outline'

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`bg-white rounded-xl shadow-lg border border-gray-200 w-full ${maxWidth} p-6 space-y-4 overflow-visible`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h3 id="modal-title" className="font-semibold text-gray-900 text-lg">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
            aria-label="Закрыть"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
