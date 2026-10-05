import { ArrowsRotateRight, CircleExclamation, Hourglass, Sparkles } from '@gravity-ui/icons'
import { OUTPUT_SIZE_LABELS, OUTPUT_TOKENS_BY_SIZE } from '@/config'
import type { JevStatus } from '@/hooks/usePromptAnalysis'
import { formatInteger, formatTokens } from '@/lib/format'
import type { PromptAnalysis, PromptPayload } from '@/types/analysis'

interface PromptStatsBarProps {
  payload: PromptPayload
  analysis: PromptAnalysis | null
  status: JevStatus
  error: string | null
}

const STATUS_INDICATOR = {
  idle: { Icon: Hourglass, className: 'text-ink-3' },
  analyzing: { Icon: ArrowsRotateRight, className: 'text-brand' },
  online: { Icon: Sparkles, className: 'text-ok' },
  error: { Icon: CircleExclamation, className: 'text-danger' },
} satisfies Record<JevStatus, unknown>

export function PromptStatsBar({ payload, analysis, status, error }: PromptStatsBarProps) {
  const outputTokens = analysis ? OUTPUT_TOKENS_BY_SIZE[analysis.outputSize] : null
  const { Icon, className } = STATUS_INDICATOR[status]
  const statusLabel = {
    idle: 'Jev en espera',
    analyzing: 'Jev analizando…',
    online: `Jev · ${formatInteger(analysis?.durationMs ?? 0)}ms`,
    error: 'Jev no disponible',
  }[status]

  const stats = [
    {
      label: 'Tokens',
      value: formatInteger(payload.inputTokens),
      hint: 'Conteo con o200k_base (GPT-4o/GPT-5); otros proveedores se aproximan',
    },
    {
      label: 'Salida estimada',
      value: analysis && outputTokens ? `${OUTPUT_SIZE_LABELS[analysis.outputSize]} (~${formatTokens(outputTokens)})` : '—',
      hint: 'Largo de la respuesta según Jev, sin tokens de razonamiento',
    },
    {
      label: 'Ventana requerida',
      value: outputTokens ? `≥ ${formatTokens(payload.inputTokens + outputTokens)}` : '—',
      hint: 'Contexto mínimo: tokens de entrada + salida estimada',
    },
  ]

  return (
    <div className="flex shrink-0 items-center justify-between gap-4 border-t border-line-soft bg-canvas px-6 py-2.5 font-mono text-xs">
      <div className="flex items-center gap-5 text-ink-2">
        {stats.map((stat) => (
          <span key={stat.label} title={stat.hint} className="whitespace-nowrap">
            {stat.label}: <strong className="font-semibold text-ink">{stat.value}</strong>
          </span>
        ))}
      </div>
      <span
        role="status"
        title={status === 'error' ? (error ?? undefined) : undefined}
        className={`flex shrink-0 items-center gap-1.5 font-semibold ${className}`}
      >
        <Icon className={`size-3.5 ${status === 'analyzing' ? 'animate-spin' : ''}`} />
        {statusLabel}
      </span>
    </div>
  )
}
