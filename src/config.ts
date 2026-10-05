import type { OutputSize, TaskCategory } from '@/types/analysis'
import type { RouteTag } from '@/types/model'

// ! Proyecto
export const APP_NAME = 'JevPrompting'

// ! URLs y endpoints
export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1'
export const JEV_ENDPOINT = '/api/jev'
export const JEV_MODEL = 'jev-latest'
export const TYPESAFE_KEYS_URL = 'https://console.typesafe.ai/keys'

// ! Almacenamiento local
export const API_KEY_STORAGE_KEY = 'jevprompting:typesafe-api-key'
export const THEME_STORAGE_KEY = 'jevprompting:theme'

// ! Catálogo de modelos
export const CATALOG_PROVIDERS = [
  'anthropic',
  'openai',
  'google',
  'deepseek',
  'meta-llama',
  'mistralai',
  'x-ai',
  'qwen',
  'moonshotai',
  'z-ai',
]
export const CATALOG_CACHE_KEY = 'jevprompting:catalog'
export const CATALOG_CACHE_TTL_MS = 6 * 60 * 60 * 1000

// ! Análisis del prompt
export const ANALYSIS_DEBOUNCE_MS = 900
export const JEV_STATE_MAX_CHARS = 60_000
export const OUTPUT_TOKENS_BY_SIZE: Record<OutputSize, number> = {
  short: 250,
  medium: 900,
  long: 2500,
}
export const REASONING_TOKEN_MULTIPLIER = 1
export const TOKENIZER_FACTOR_BY_PROVIDER: Record<string, number> = {
  anthropic: 1.2,
}

// ! Ranking
export const ALTERNATIVE_ROUTES_COUNT = 3
export const VIABLE_FIT_RATIO = 0.6
export const RANKING_TABLE_SIZE = 10

// ! Etiquetas de UI
export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  coding: 'Código & Refactor',
  reasoning: 'Razonamiento / Matemática',
  writing: 'Redacción creativa',
  analysis: 'Análisis & Resumen',
  extraction: 'Extracción / Clasificación',
  chat: 'Conversación simple',
  translation: 'Traducción',
}
export const OUTPUT_SIZE_LABELS: Record<OutputSize, string> = {
  short: 'Corta',
  medium: 'Media',
  long: 'Extensa',
}
export const ROUTE_TAG_LABELS: Record<RouteTag, string> = {
  cheapest: 'Económica',
  fastest: 'Más rápida',
  longContext: 'Contexto extenso',
  reasoning: 'Razonamiento profundo',
}

// ! Contenido inicial
export const DEFAULT_PROMPT = `# ROL Y DIRECTIVA DEL SISTEMA
Eres un arquitecto sénior en sistemas distribuidos y optimización de código concurrente.

# OBJETIVO DE LA TAREA
Analiza el siguiente worker de procesamiento asíncrono en \`Python (AsyncIO / uvloop)\` que experimenta contención severa por el GIL durante picos de 45,000 req/s.

// Requisitos obligatorios:
1. Identifica el cuello de botella exacto en las operaciones de serialización \`orjson.loads()\` dentro de threads compartidos.
2. Propón una reescritura de bajo nivel utilizando extensiones nativas en \`Rust (vía PyO3)\` sin bloquear el event-loop principal.
3. Genera tests unitarios de estrés con simulación de backpressure y cálculo formal de complejidad espacial O(N).

# CÓDIGO FUENTE OBJETIVO:
\`\`\`python
def worker_dispatch(payload: bytes) -> AsyncResult:
    state = parse_raw_telemetry(payload)
    return await batch_distribute(state.partition_id, state.nodes)
\`\`\`
`
