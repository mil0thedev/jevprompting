import { CATEGORY_LABELS } from '@/config'
import { formatPercent } from '@/lib/format'
import type { PromptAnalysis } from '@/types/analysis'

interface AnalysisSummaryProps {
  analysis: PromptAnalysis | null
}

interface Cell {
  label: string
  value: string
  className: string
  hint?: string
}

const CELL_LABELS = ['Categoría', 'Complejidad', 'Razonamiento']

const level = (value: number) => (value >= 0.7 ? 'Alta' : value >= 0.4 ? 'Media' : 'Baja')

function buildCells(analysis: PromptAnalysis): Cell[] {
  return [
    {
      label: 'Categoría',
      value: CATEGORY_LABELS[analysis.category],
      hint: `Confianza ${formatPercent(analysis.categoryConfidence, 0)}`,
      className: 'text-ink',
    },
    {
      label: 'Complejidad',
      value: `${level(analysis.complexity)} (${(analysis.complexity * 10).toFixed(1)}/10)`,
      className: 'text-brand',
    },
    {
      label: 'Razonamiento',
      value: formatPercent(analysis.needsReasoning, 0),
      hint: 'Probabilidad de necesitar razonamiento multi-paso',
      className: 'text-accent',
    },
  ]
}

export function AnalysisSummary({ analysis }: AnalysisSummaryProps) {
  const cells = analysis
    ? buildCells(analysis)
    : CELL_LABELS.map((label) => ({ label, value: '—', className: 'text-ink-3', hint: undefined }))

  return (
    <div className="grid shrink-0 grid-cols-3 gap-4 border-t border-line-soft bg-surface px-6 py-2.5 font-mono text-xs">
      {cells.map((cell) => (
        <div key={cell.label} className="flex min-w-0 flex-col gap-0.5" title={cell.hint}>
          <span className="text-[10px] font-semibold tracking-wider text-ink-3 uppercase">{cell.label}</span>
          <span className={`truncate font-semibold ${cell.className}`}>{cell.value}</span>
        </div>
      ))}
    </div>
  )
}
