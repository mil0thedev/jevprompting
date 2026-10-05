import { CATALOG_CACHE_KEY, CATALOG_CACHE_TTL_MS, CATALOG_PROVIDERS, OPENROUTER_API_URL } from '@/config'
import type { CatalogModel } from '@/types/model'

interface OpenRouterModel {
  id: string
  name: string
  context_length: number
  pricing: { prompt: string; completion: string }
  architecture: { input_modalities: string[]; output_modalities: string[] }
  supported_parameters?: string[]
  reasoning?: { mandatory?: boolean } | null
  benchmarks?: { artificial_analysis?: { intelligence_index?: number | null } | null } | null
}

export function toCatalogModel(raw: OpenRouterModel): CatalogModel | null {
  const [provider] = raw.id.split('/')
  const intelligenceIndex = raw.benchmarks?.artificial_analysis?.intelligence_index
  const inputPrice = Number(raw.pricing.prompt)
  const outputPrice = Number(raw.pricing.completion)

  const isEligible =
    CATALOG_PROVIDERS.includes(provider) &&
    !raw.id.includes(':') &&
    raw.architecture.input_modalities.includes('text') &&
    raw.architecture.output_modalities.includes('text') &&
    typeof intelligenceIndex === 'number' &&
    inputPrice > 0 &&
    outputPrice > 0
  if (!isEligible) return null

  return {
    id: raw.id,
    name: raw.name.replace(/^[^:]+:\s*/, ''),
    provider,
    contextLength: raw.context_length,
    inputPrice,
    outputPrice,
    supportsReasoning: raw.supported_parameters?.includes('reasoning') ?? false,
    reasoningMandatory: raw.reasoning?.mandatory ?? false,
    intelligenceIndex,
  }
}

function readCache(): CatalogModel[] | null {
  try {
    const cached = JSON.parse(localStorage.getItem(CATALOG_CACHE_KEY) ?? 'null')
    return cached && Date.now() - cached.savedAt < CATALOG_CACHE_TTL_MS ? cached.models : null
  } catch {
    return null
  }
}

export async function fetchCatalog(signal?: AbortSignal, { force = false } = {}): Promise<CatalogModel[]> {
  const cached = force ? null : readCache()
  if (cached) return cached

  const response = await fetch(`${OPENROUTER_API_URL}/models`, { signal })
  if (!response.ok) throw new Error(`OpenRouter respondió ${response.status}`)
  const { data } = (await response.json()) as { data: OpenRouterModel[] }
  const models = data.map(toCatalogModel).filter((model): model is CatalogModel => model !== null)

  localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), models }))
  return models
}
