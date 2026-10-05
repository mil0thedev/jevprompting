import {
  ALTERNATIVE_ROUTES_COUNT,
  CATEGORY_LABELS,
  OUTPUT_TOKENS_BY_SIZE,
  REASONING_TOKEN_MULTIPLIER,
  TOKENIZER_FACTOR_BY_PROVIDER,
  VIABLE_FIT_RATIO,
} from '@/config'
import { formatUsd } from '@/lib/format'
import type { PromptAnalysis, PromptPayload } from '@/types/analysis'
import type { CatalogModel, CostBreakdown, RankedModel, RouteTag } from '@/types/model'

export function usesReasoning(model: CatalogModel, analysis: PromptAnalysis): boolean {
  return model.reasoningMandatory || (model.supportsReasoning && analysis.needsReasoning >= 0.5)
}

export function estimateCost(model: CatalogModel, payload: PromptPayload, analysis: PromptAnalysis): CostBreakdown {
  const inputTokens = Math.round(payload.inputTokens * (TOKENIZER_FACTOR_BY_PROVIDER[model.provider] ?? 1))
  const answerTokens = OUTPUT_TOKENS_BY_SIZE[analysis.outputSize]
  const reasoningTokens = usesReasoning(model, analysis)
    ? answerTokens * REASONING_TOKEN_MULTIPLIER * (0.3 + analysis.complexity)
    : 0
  const outputTokens = Math.round(answerTokens + reasoningTokens)
  const input = inputTokens * model.inputPrice
  const output = outputTokens * model.outputPrice
  return { inputTokens, outputTokens, input, output, total: input + output }
}

/** Rough end-to-end latency: prefill + generation at a throughput inferred from the price tier. */
export function estimateLatencyMs(model: CatalogModel, cost: CostBreakdown): number {
  const outputPerMillion = model.outputPrice * 1_000_000
  const tokensPerSecond = outputPerMillion < 1 ? 160 : outputPerMillion < 5 ? 110 : outputPerMillion < 15 ? 70 : 45
  const timeToFirstToken = 300 + cost.inputTokens * 0.02
  return Math.round(timeToFirstToken + (cost.outputTokens / tokensPerSecond) * 1000)
}

const normalizeLog = (value: number, min: number, max: number) =>
  max === min ? 1 : (Math.log(max) - Math.log(value)) / (Math.log(max) - Math.log(min))

export function rankModels(catalog: CatalogModel[], payload: PromptPayload, analysis: PromptAnalysis): RankedModel[] {
  const candidates = catalog
    .map((model) => {
      const cost = estimateCost(model, payload, analysis)
      return { model, cost, latencyMs: estimateLatencyMs(model, cost) }
    })
    .filter(({ model, cost }) => model.contextLength >= cost.inputTokens + cost.outputTokens)
  if (!candidates.length) return []

  const range = (values: number[]) => [Math.min(...values), Math.max(...values)] as const
  const [minIndex, maxIndex] = range(candidates.map((c) => c.model.intelligenceIndex))
  const [minCost, maxCost] = range(candidates.map((c) => c.cost.total))
  const [minLatency, maxLatency] = range(candidates.map((c) => c.latencyMs))

  const { complexity, latencySensitive, needsReasoning, hallucinationRisk } = analysis
  const qualityWeight = 0.3 + 0.55 * complexity + 0.15 * hallucinationRisk
  const costWeight = 0.4 - 0.25 * complexity
  const speedWeight = Math.max(0.05, 0.15 + 0.3 * latencySensitive - 0.1 * complexity)
  const totalWeight = qualityWeight + costWeight + speedWeight

  const ranked = candidates.map(({ model, cost, latencyMs }) => {
    const quality = maxIndex === minIndex ? 1 : (model.intelligenceIndex - minIndex) / (maxIndex - minIndex)
    const affordability = normalizeLog(cost.total, minCost, maxCost)
    const speed = normalizeLog(latencyMs, minLatency, maxLatency)
    const reasoningPenalty = needsReasoning >= 0.5 && !model.supportsReasoning ? 1 - 0.25 * needsReasoning : 1
    const fit = ((qualityWeight * quality + costWeight * affordability + speedWeight * speed) / totalWeight) * reasoningPenalty
    return { model, cost, latencyMs, fitScore: Math.round(fit * 1000) / 10, tags: [] as RouteTag[] }
  })

  const maxFit = Math.max(...ranked.map((r) => r.fitScore))
  const viable = ranked.filter((r) => r.fitScore >= maxFit * VIABLE_FIT_RATIO)
  const pickBest = (score: (r: RankedModel) => number) => viable.reduce((best, r) => (score(r) > score(best) ? r : best))
  pickBest((r) => -r.cost.total).tags.push('cheapest')
  pickBest((r) => -r.latencyMs).tags.push('fastest')
  pickBest((r) => r.model.contextLength).tags.push('longContext')
  const reasoners = viable.filter((r) => r.model.supportsReasoning)
  if (reasoners.length)
    reasoners.reduce((best, r) => (r.model.intelligenceIndex > best.model.intelligenceIndex ? r : best)).tags.push('reasoning')

  return ranked.sort((a, b) => b.fitScore - a.fitScore)
}

export interface Route {
  ranked: RankedModel
  tag?: RouteTag
}

const ROUTE_TAG_ORDER: RouteTag[] = ['cheapest', 'fastest', 'reasoning', 'longContext']

/** Alternatives favour one model per tag (cheapest, fastest...), then fill with the next best fits. */
export function pickAlternatives(ranked: RankedModel[], primaryId: string): Route[] {
  const routes: Route[] = []
  const taken = new Set([primaryId])
  for (const tag of ROUTE_TAG_ORDER) {
    const match = ranked.find((r) => r.tags.includes(tag) && !taken.has(r.model.id))
    if (match && routes.length < ALTERNATIVE_ROUTES_COUNT) {
      routes.push({ ranked: match, tag })
      taken.add(match.model.id)
    }
  }
  for (const r of ranked) {
    if (routes.length >= ALTERNATIVE_ROUTES_COUNT) break
    if (!taken.has(r.model.id)) {
      routes.push({ ranked: r })
      taken.add(r.model.id)
    }
  }
  return routes
}

const complexityLabel = (complexity: number) => (complexity >= 0.7 ? 'alta' : complexity >= 0.4 ? 'media' : 'baja')

export function buildRationale(selected: RankedModel, ranked: RankedModel[], analysis: PromptAnalysis): string {
  const position = ranked.indexOf(selected) + 1
  const bestQuality = ranked.reduce((best, r) => (r.model.intelligenceIndex > best.model.intelligenceIndex ? r : best))
  const parts = [
    `Puesto #${position} de ${ranked.length} para una tarea de ${CATEGORY_LABELS[analysis.category].toLowerCase()} con complejidad ${complexityLabel(analysis.complexity)}.`,
    `Índice de inteligencia ${selected.model.intelligenceIndex} (máximo disponible: ${bestQuality.model.intelligenceIndex}).`,
  ]
  if (bestQuality !== selected && bestQuality.cost.total > selected.cost.total) {
    const ratio = bestQuality.cost.total / selected.cost.total
    parts.push(`${ratio.toFixed(1)}× más barato que ${bestQuality.model.name} (${formatUsd(bestQuality.cost.total)}/req).`)
  }
  if (usesReasoning(selected.model, analysis)) parts.push('Incluye tokens de razonamiento en el costo estimado.')
  return parts.join(' ')
}
