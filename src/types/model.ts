export interface CatalogModel {
  id: string
  name: string
  provider: string
  contextLength: number
  /** USD per input token */
  inputPrice: number
  /** USD per output token */
  outputPrice: number
  supportsReasoning: boolean
  reasoningMandatory: boolean
  intelligenceIndex: number
}

export type RouteTag = 'cheapest' | 'fastest' | 'longContext' | 'reasoning'

export interface CostBreakdown {
  inputTokens: number
  outputTokens: number
  input: number
  output: number
  total: number
}

export interface RankedModel {
  model: CatalogModel
  /** 0..100 */
  fitScore: number
  cost: CostBreakdown
  latencyMs: number
  tags: RouteTag[]
}
