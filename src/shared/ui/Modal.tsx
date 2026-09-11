import type { MouseEvent, ReactNode } from 'react'

interface ModalProps {
  onClose: () => void
  children: ReactNode
  widthClassName?: string
}

function Modal({ onClose, children, widthClassName = 'max-w-sm' }: ModalProps) {
  const stop = (e: MouseEvent) => e.stopPropagation()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`w-full ${widthClassName} rounded-xl bg-white shadow-xl`}
        onClick={stop}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  )
}

export default Modal
