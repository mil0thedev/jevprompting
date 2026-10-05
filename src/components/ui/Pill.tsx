import type { ReactNode } from 'react'

export type PillTone = 'green' | 'blue' | 'purple' | 'amber' | 'gray'

const TONES: Record<PillTone, string> = {
  green: 'bg-ok-soft text-ok border-ok-line',
  blue: 'bg-brand-soft text-brand border-brand-line',
  purple: 'bg-accent-soft text-accent border-accent-line',
  amber: 'bg-warn-soft text-warn border-warn-line',
  gray: 'bg-hover text-ink-2 border-line',
}

interface PillProps {
  tone?: PillTone
  children: ReactNode
  className?: string
  title?: string
}

export function Pill({ tone = 'gray', children, className = '', title }: PillProps) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded border px-2 py-0.5 text-[10px] font-semibold ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
