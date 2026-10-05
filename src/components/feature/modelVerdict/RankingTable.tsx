import { ChevronRight } from '@gravity-ui/icons'
import { RANKING_TABLE_SIZE } from '@/config'
import { formatLatency, formatTokens, formatUsd } from '@/lib/format'
import type { RankedModel } from '@/types/model'

interface RankingTableProps {
  ranked: RankedModel[]
  selectedId: string
  onSelect: (id: string) => void
}

export function RankingTable({ ranked, selectedId, onSelect }: RankingTableProps) {
  return (
    <details className="group rounded-lg border border-line bg-surface">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 px-3 py-2 font-mono text-[11px] font-semibold tracking-wider text-ink-2 uppercase select-none hover:text-ink">
        <ChevronRight className="size-3.5 transition-transform group-open:rotate-90" /> Ranking completo (top{' '}
        {Math.min(RANKING_TABLE_SIZE, ranked.length)} de {ranked.length})
      </summary>
      <table className="w-full border-t border-line-soft font-mono text-[11px]">
        <thead className="text-left text-[10px] text-ink-3 uppercase">
          <tr>
            <th className="px-3 py-1.5 font-semibold">Modelo</th>
            <th className="px-2 py-1.5 text-right font-semibold">Fit</th>
            <th className="px-2 py-1.5 text-right font-semibold">Costo/req</th>
            <th className="px-2 py-1.5 text-right font-semibold">Latencia</th>
            <th className="px-3 py-1.5 text-right font-semibold">Ctx</th>
          </tr>
        </thead>
        <tbody>
          {ranked.slice(0, RANKING_TABLE_SIZE).map((r) => (
            <tr
              key={r.model.id}
              onClick={() => onSelect(r.model.id)}
              className={`cursor-pointer border-t border-line-soft hover:bg-hover ${r.model.id === selectedId ? 'bg-brand-soft' : ''}`}
            >
              <td className="max-w-40 truncate px-3 py-1.5 text-ink" title={r.model.id}>
                {r.model.name}
              </td>
              <td className="px-2 py-1.5 text-right font-semibold">{r.fitScore.toFixed(1)}</td>
              <td className="px-2 py-1.5 text-right text-ok">{formatUsd(r.cost.total)}</td>
              <td className="px-2 py-1.5 text-right">{formatLatency(r.latencyMs)}</td>
              <td className="px-3 py-1.5 text-right text-ink-2">{formatTokens(r.model.contextLength)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  )
}
