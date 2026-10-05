export type TaskCategory =
  | 'coding'
  | 'reasoning'
  | 'writing'
  | 'analysis'
  | 'extraction'
  | 'chat'
  | 'translation'

export type OutputSize = 'short' | 'medium' | 'long'

export interface PromptAnalysis {
  /** Versioned Jev model that answered, e.g. jev-1.13.0 */
  engine: string
  category: TaskCategory
  categoryConfidence: number
  /** 0..1 */
  complexity: number
  /** 0..1 probability that the task needs multi-step reasoning */
  needsReasoning: number
  outputSize: OutputSize
  /** 0..1 probability that the user expects a fast answer */
  latencySensitive: number
  /** 0..1 */
  hallucinationRisk: number
  durationMs: number
}

export interface PromptPayload {
  text: string
  inputTokens: number
  characters: number
}
