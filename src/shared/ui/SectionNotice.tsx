import type { ComponentType, ReactNode } from 'react'

interface SectionNoticeProps {
  icon: ComponentType<{ size?: number; className?: string }>
  children: ReactNode
}

function SectionNotice({ icon: Icon, children }: SectionNoticeProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-neutral-200 py-10 text-center">
      <Icon size={20} className="text-neutral-300" />
      <p className="text-body-small text-neutral-400">{children}</p>
    </div>
  )
}

export default SectionNotice
