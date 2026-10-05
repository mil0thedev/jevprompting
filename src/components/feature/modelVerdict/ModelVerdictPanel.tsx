import { useMemo, useState, type ComponentType, type ReactNode, type SVGProps } from 'react'
import { ArrowsRotateRight, Ban, CircleExclamation, CloudSlash, Key, PencilToLine, Sparkles } from '@gravity-ui/icons'
import type { AnalysisError } from '@/hooks/usePromptAnalysis'
import { buildRationale, pickAlternatives } from '@/services/modelRanker'
import type { PromptAnalysis } from '@/types/analysis'
import type { RankedModel } from '@/types/model'
import { AlternativeRouteCard } from './AlternativeRouteCard'
import { RankingTable } from './RankingTable'
import { RecommendedModelCard } from './RecommendedModelCard'

interface ModelVerdictPanelProps {
  ranked: RankedModel[]
  analysis: PromptAnalysis | null
  jevError: AnalysisError | null
  isEmpty: boolean
  hasApiKey: boolean
  onOpenApiKey: () => void
  catalogStatus: 'loading' | 'ready' | 'error'
  catalogError: string | null
  onReloadCatalog: () => void
}

interface EmptyStateProps {
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  spin?: boolean
  children: ReactNode
}

function EmptyState({ Icon, spin = false, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line bg-surface p-8 text-center text-xs text-ink-2">
      <Icon className={`size-7 text-ink-3 ${spin ? 'animate-spin' : ''}`} />
      {children}
    </div>
  )
}

const primaryButton = 'flex items-center gap-1.5 rounded bg-brand px-3 py-1.5 font-medium text-on-brand hover:bg-brand-hover'

export function ModelVerdictPanel({
  ranked,
  analysis,
  jevError,
  isEmpty,
  hasApiKey,
  onOpenApiKey,
  catalogStatus,
  catalogError,
  onReloadCatalog,
}: ModelVerdictPanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const primary = ranked[0]
  const selected = ranked.find((r) => r.model.id === selectedId) ?? primary
  const alternatives = useMemo(() => (primary ? pickAlternatives(ranked, primary.model.id) : []), [ranked, primary])

  const renderBody = () => {
    if (catalogStatus === 'error')
      return (
        <EmptyState Icon={CloudSlash}>
          <p>No se pudo cargar el catálogo de OpenRouter: {catalogError}</p>
          <button type="button" onClick={onReloadCatalog} className={primaryButton}>
            Reintentar
          </button>
        </EmptyState>
      )
    if (catalogStatus === 'loading' && !ranked.length)
      return (
        <EmptyState Icon={ArrowsRotateRight} spin>
          <p>Cargando precios y modelos desde OpenRouter…</p>
        </EmptyState>
      )
    if (isEmpty)
      return (
        <EmptyState Icon={PencilToLine}>
          <p>Escribe un prompt para ver los modelos recomendados.</p>
        </EmptyState>
      )
    if (jevError?.isAuthError)
      return (
        <EmptyState Icon={Key}>
          <p className="font-semibold text-ink">{hasApiKey ? 'Tu API key de TypeSafe no es válida' : 'Necesitas una API key de TypeSafe'}</p>
          <p>JevPrompting usa Jev para analizar el prompt. Ingresa tu propia key para ver los modelos recomendados.</p>
        </EmptyState>
      )
    if (jevError)
      return (
        <EmptyState Icon={CircleExclamation}>
          <p className="font-semibold text-danger">Jev no pudo analizar el prompt</p>
          <p className="font-mono text-[11px]">{jevError.message}</p>
          <p>El análisis se reintenta al editar el prompt.</p>
        </EmptyState>
      )
    if (!analysis)
      return (
        <EmptyState Icon={ArrowsRotateRight} spin>
          <p>Jev está analizando el prompt…</p>
        </EmptyState>
      )
    if (!primary || !selected)
      return (
        <EmptyState Icon={Ban}>
          <p>Ningún modelo del catálogo admite este tamaño de entrada.</p>
        </EmptyState>
      )

    return (
      <>
        <RecommendedModelCard
          ranked={selected}
          isPrimary={selected === primary}
          rationale={buildRationale(selected, ranked, analysis)}
          onReset={() => setSelectedId(null)}
        />
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-semibold tracking-wider text-ink-2 uppercase">Rutas alternativas disponibles</span>
          {alternatives.map((route) => (
            <AlternativeRouteCard
              key={route.ranked.model.id}
              route={route}
              isSelected={route.ranked === selected}
              onSelect={() => setSelectedId(route.ranked === selected ? null : route.ranked.model.id)}
            />
          ))}
        </div>
        <RankingTable ranked={ranked} selectedId={selected.model.id} onSelect={setSelectedId} />
      </>
    )
  }

  return (
    <section className="col-span-12 flex h-full flex-col gap-4 overflow-y-auto bg-canvas p-6 lg:col-span-5">
      <div className="flex items-center gap-2 border-b border-line pb-2">
        <Sparkles className="size-[18px] text-brand" />
        <h2 className="text-sm font-bold tracking-tight">Veredicto</h2>
      </div>
      {renderBody()}
      <p className="mt-auto pt-2 font-mono text-[10px] leading-relaxed text-ink-3">
        Precios en vivo de OpenRouter. Latencia y tokens de salida son estimaciones; el conteo de tokens usa o200k_base y se
        ajusta por proveedor.
      </p>
    </section>
  )
}
