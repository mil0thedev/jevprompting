import { ROUTE_TAG_LABELS } from '@/config'
import { Pill, type PillTone } from '@/components/ui/Pill'
import { formatLatency, formatUsd } from '@/lib/format'
import type { Route } from '@/services/modelRanker'
import type { RouteTag } from '@/types/model'

const TAG_TONES: Record<RouteTag, PillTone> = {
  cheapest: 'green',
  fastest: 'amber',
  longContext: 'blue',
  reasoning: 'purple',
}

interface AlternativeRouteCardProps {
  route: Route
  isSelected: boolean
  onSelect: () => void
}

export function AlternativeRouteCard({ route, isSelected, onSelect }: AlternativeRouteCardProps) {
  const { ranked, tag } = route

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`flex w-full items-center justify-between gap-3 rounded-lg border bg-surface p-3 text-left shadow-sm transition-all hover:shadow ${
        isSelected ? 'border-brand ring-1 ring-brand' : 'border-line hover:border-brand/40'
      }`}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate font-mono text-xs font-medium">{ranked.model.name}</span>
          {tag && <Pill tone={TAG_TONES[tag]}>{ROUTE_TAG_LABELS[tag]}</Pill>}
        </div>
        <span className="font-mono text-[11px] text-ink-2">
          {formatLatency(ranked.latencyMs)} · {formatUsd(ranked.cost.total)}/req
        </span>
      </div>
      <span className="shrink-0 font-mono text-xs font-semibold">{ranked.fitScore.toFixed(1)}%</span>
    </button>
  )
}
