import type { ReactNode, RefObject } from 'react'

export interface ActionSheetItem {
  icon?: ReactNode
  label: string
  onClick: () => void
  destructive?: boolean
}

interface ActionSheetProps {
  open: boolean
  onClose: () => void
  items: ActionSheetItem[]
  align?: 'left' | 'right'
  panelRef?: RefObject<HTMLDivElement | null>
}

function ActionSheet({ open, onClose, items, align = 'right', panelRef }: ActionSheetProps) {
  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-neutral-900/40 lg:hidden" onClick={onClose} role="presentation" />
      <div
        ref={panelRef}
        className={`fixed inset-x-0 bottom-0 z-50 overflow-hidden rounded-t-2xl bg-white py-2 shadow-xl lg:absolute lg:inset-x-auto lg:bottom-auto lg:top-full lg:mt-2 lg:w-52 lg:rounded-lg lg:border lg:border-neutral-200 ${align === 'right' ? 'lg:right-0' : 'lg:left-0'}`}
      >
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              item.onClick()
              onClose()
            }}
            className={`flex w-full items-center gap-2.5 px-4 py-3 text-left text-body-medium hover:bg-neutral-100 lg:py-2.5 ${item.destructive ? 'text-error-700' : 'text-neutral-800'}`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    </>
  )
}

export default ActionSheet
