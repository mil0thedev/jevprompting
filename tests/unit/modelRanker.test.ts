import { describe, expect, it } from 'vitest'
import { estimateCost, pickAlternatives, rankModels } from '@/services/modelRanker'
import type { PromptAnalysis, PromptPayload } from '@/types/analysis'
import type { CatalogModel } from '@/types/model'

const model = (overrides: Partial<CatalogModel> & Pick<CatalogModel, 'id'>): CatalogModel => ({
  name: overrides.id,
  provider: overrides.id.split('/')[0],
  contextLength: 128_000,
  inputPrice: 1e-6,
  outputPrice: 4e-6,
  supportsReasoning: false,
  reasoningMandatory: false,
  intelligenceIndex: 40,
  ...overrides,
})

const catalog = [
  model({ id: 'openai/frontier', intelligenceIndex: 70, inputPrice: 5e-6, outputPrice: 25e-6, supportsReasoning: true, contextLength: 400_000 }),
  model({ id: 'deepseek/budget', intelligenceIndex: 45, inputPrice: 0.2e-6, outputPrice: 0.8e-6 }),
  model({ id: 'google/longctx', intelligenceIndex: 55, inputPrice: 1.25e-6, outputPrice: 10e-6, contextLength: 2_000_000 }),
  model({ id: 'anthropic/mid', intelligenceIndex: 60, inputPrice: 3e-6, outputPrice: 15e-6, supportsReasoning: true }),
]

const analysis = (overrides: Partial<PromptAnalysis> = {}): PromptAnalysis => ({
  engine: 'jev-test',
  category: 'chat',
  categoryConfidence: 1,
  complexity: 0.2,
  needsReasoning: 0.1,
  outputSize: 'short',
  latencySensitive: 0,
  hallucinationRisk: 0.1,
  durationMs: 0,
  ...overrides,
})

const payload = (overrides: Partial<PromptPayload> = {}): PromptPayload => ({
  text: 'hola',
  inputTokens: 500,
  characters: 4,
  ...overrides,
})

describe('rankModels', () => {
  it('favours cheap models for simple prompts', () => {
    const [top] = rankModels(catalog, payload(), analysis())
    expect(top.model.id).toBe('deepseek/budget')
  })

  it('favours high-quality reasoning models for complex prompts', () => {
    const [top] = rankModels(catalog, payload({ inputTokens: 4000 }), analysis({ complexity: 0.95, needsReasoning: 0.9, outputSize: 'long' }))
    expect(top.model.id).toBe('openai/frontier')
  })

  it('excludes models whose context window is too small', () => {
    const ranked = rankModels(catalog, payload({ inputTokens: 900_000 }), analysis())
    expect(ranked.map((r) => r.model.id)).toEqual(['google/longctx'])
  })

  it('tags the cheapest, fastest, long-context and reasoning routes', () => {
    const ranked = rankModels(catalog, payload(), analysis())
    const tagged = (tag: string) => ranked.find((r) => r.tags.includes(tag as never))?.model.id
    expect(tagged('cheapest')).toBe('deepseek/budget')
    expect(tagged('longContext')).toBe('google/longctx')
    expect(tagged('reasoning')).toBe('openai/frontier')
  })

  it('keeps fit scores within 0..100 sorted descending', () => {
    const scores = rankModels(catalog, payload(), analysis({ complexity: 0.5 })).map((r) => r.fitScore)
    expect(scores).toEqual([...scores].sort((a, b) => b - a))
    expect(scores.every((s) => s >= 0 && s <= 100)).toBe(true)
  })
})

describe('estimateCost', () => {
  it('adds reasoning tokens and applies the provider tokenizer factor', () => {
    const anthropic = catalog[3]
    const cost = estimateCost(anthropic, payload({ inputTokens: 1000 }), analysis({ needsReasoning: 0.8, complexity: 0.5 }))
    expect(cost.inputTokens).toBe(1200)
    expect(cost.outputTokens).toBeGreaterThan(250)
    expect(cost.total).toBeCloseTo(cost.inputTokens * 3e-6 + cost.outputTokens * 15e-6)
  })
})

describe('pickAlternatives', () => {
  it('never repeats the primary model and returns at most three routes', () => {
    const ranked = rankModels(catalog, payload(), analysis())
    const routes = pickAlternatives(ranked, ranked[0].model.id)
    const ids = routes.map((r) => r.ranked.model.id)
    expect(ids).not.toContain(ranked[0].model.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.length).toBe(3)
  })
})
