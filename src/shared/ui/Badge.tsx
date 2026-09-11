import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  tone?: 'neutral' | 'primary'
  className?: string
}

function Badge({ children, tone = 'neutral', className = '' }: BadgeProps) {
  const toneClass = tone === 'primary' ? 'bg-primary-100 text-primary-700' : 'bg-neutral-200 text-neutral-700'

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-label-small font-medium ${toneClass} ${className}`}
    >
      {children}
    </span>
  )
}

export default Badge
