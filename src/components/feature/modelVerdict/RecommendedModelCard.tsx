import { useState } from 'react'
import { ArrowUturnCcwLeft, Check, Copy } from '@gravity-ui/icons'
import { formatInteger, formatLatency, formatPerMillion, formatTokens, formatUsd } from '@/lib/format'
import type { RankedModel } from '@/types/model'

interface RecommendedModelCardProps {
  ranked: RankedModel
  isPrimary: boolean
  rationale: string
  onReset: () => void
}

const fitTone = (score: number) =>
  score >= 75
    ? 'bg-ok-soft border-ok-line text-ok'
    : score >= 50
      ? 'bg-brand-soft border-brand-line text-brand'
      : 'bg-warn-soft border-warn-line text-warn'

export function RecommendedModelCard({ ranked, isPrimary, rationale, onReset }: RecommendedModelCardProps) {
  const { model, cost, fitScore, latencyMs } = ranked
  const [copied, setCopied] = useState(false)

  const copyId = async () => {
    await navigator.clipboard.writeText(model.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const metrics = [
    { label: 'Latencia', value: formatLatency(latencyMs), className: 'text-ink', hint: 'Estimación: prefill + generación según tier de precio' },
    { label: 'Costo / Req', value: formatUsd(cost.total), className: 'text-ok', hint: `Entrada ${formatUsd(cost.input)} + salida ${formatUsd(cost.output)}` },
  ]

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-5 shadow-[0_1px_3px_rgba(60,64,67,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span className={`flex items-center gap-1.5 font-mono text-xs font-semibold ${isPrimary ? 'text-ok' : 'text-brand'}`}>
            <span className={`size-2 rounded-full ${isPrimary ? 'bg-ok' : 'bg-brand'}`} />
            {isPrimary ? 'Recomendación Óptima' : 'Ruta Seleccionada'}
          </span>
          <h3 className="truncate text-lg font-bold tracking-tight">{model.name}</h3>
          <span className="truncate font-mono text-[11px] text-ink-2">{model.id}</span>
        </div>
        <div className={`flex shrink-0 flex-col items-end rounded-lg border px-3 py-1 ${fitTone(fitScore)}`}>
          <span className="font-mono text-xl font-bold">{fitScore.toFixed(1)}%</span>
          <span className="font-mono text-[9px] font-semibold tracking-wider uppercase">Fit Score</span>
        </div>
      </div>

      <div className="grid grid-cols-2 rounded-lg border-y border-line-soft bg-canvas/60 py-3 text-center font-mono text-xs">
        {metrics.map((metric, index) => (
          <div key={metric.label} title={metric.hint} className={`px-2 ${index === 1 ? 'border-l border-line-soft' : ''}`}>
            <span className="block text-[10px] font-medium tracking-wider text-ink-2 uppercase">{metric.label}</span>
            <span className={`mt-0.5 block font-semibold ${metric.className}`}>{metric.value}</span>
          </div>
        ))}
      </div>

      <dl className="grid grid-cols-3 gap-2 font-mono text-[11px] text-ink-2">
        <div>
          <dt className="text-ink-3">Entrada</dt>
          <dd>
            {formatInteger(cost.inputTokens)} tok · {formatPerMillion(model.inputPrice)}
          </dd>
        </div>
        <div>
          <dt className="text-ink-3">Salida (estimada)</dt>
          <dd>
            ~{formatInteger(cost.outputTokens)} tok · {formatPerMillion(model.outputPrice)}
          </dd>
        </div>
        <div>
          <dt className="text-ink-3">Contexto</dt>
          <dd>{formatTokens(model.contextLength)} tokens</dd>
        </div>
      </dl>

      <p className="text-xs leading-relaxed text-ink-2">{rationale}</p>

      <div className="flex items-center justify-between border-t border-line-soft pt-3">
        {isPrimary ? (
          <span className="flex items-center gap-1.5 font-mono text-xs font-medium text-ink-2">
            <span className="size-1.5 rounded-full bg-ok" /> Recomendación Óptima
          </span>
        ) : (
          <button type="button" onClick={onReset} className="flex items-center gap-1 font-mono text-xs font-medium text-brand hover:underline">
            <ArrowUturnCcwLeft className="size-3.5" /> Volver a la óptima
          </button>
        )}
        <button
          type="button"
          onClick={copyId}
          className="flex items-center gap-1.5 rounded bg-brand px-3.5 py-1.5 text-xs font-medium text-on-brand shadow-sm transition-colors hover:bg-brand-hover"
        >
          <span>{copied ? 'ID copiado' : 'Copiar ID del modelo'}</span>
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>
      </div>
    </article>
  )
}
