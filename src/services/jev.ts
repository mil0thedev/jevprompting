import { JEV_ENDPOINT, JEV_MODEL, JEV_STATE_MAX_CHARS } from '@/config'
import { clamp01 } from '@/lib/format'
import type { OutputSize, PromptAnalysis, TaskCategory } from '@/types/analysis'

const CATEGORY_CRITERIA: Record<TaskCategory, string> = {
  coding: 'Write, review, debug, explain or refactor source code',
  reasoning: 'Math, logic puzzles, formal proofs or multi-step planning',
  writing: 'Creative or marketing writing: stories, emails, posts, copy',
  analysis: 'Summarize, analyze, critique or compare documents or data',
  extraction: 'Extract fields, classify items or convert content to structured output',
  chat: 'Simple question, casual conversation or a quick fact',
  translation: 'Translate text between languages',
}

const OUTPUT_SIZE_CRITERIA: Record<OutputSize, string> = {
  short: 'A few sentences, a short list or under 300 tokens',
  medium: 'Several paragraphs or a medium-sized code snippet',
  long: 'A long document, several files of code or an exhaustive report',
}

const COMPLEXITY_LEVELS = [
  'Trivial: a one-line answer anyone could give',
  'Simple: routine task with clear instructions',
  'Moderate: several requirements to satisfy at once',
  'Hard: expert domain knowledge and many constraints',
  'Very hard: frontier-level expertise and a long multi-part deliverable',
]

const PRECISION_LEVELS = [
  'Not at all: opinion, brainstorming or creative content',
  'Somewhat: general well-known knowledge',
  'Heavily: exact facts, figures, citations or API details',
]

const QUESTIONS = {
  category: {
    type: 'choice',
    instructions: 'What kind of task does `prompt` ask an AI assistant to perform?',
    criteria: CATEGORY_CRITERIA,
  },
  complexity: {
    type: 'score',
    instructions: 'How demanding is the task in `prompt` for a large language model?',
    criteria: COMPLEXITY_LEVELS,
  },
  needs_reasoning: {
    type: 'noul',
    instructions:
      'Answering `prompt` well requires careful multi-step reasoning (planning, math, debugging, formal analysis) rather than direct recall or rewriting.',
  },
  output_size: {
    type: 'choice',
    instructions: 'How long will a complete answer to `prompt` be?',
    criteria: OUTPUT_SIZE_CRITERIA,
  },
  latency_sensitive: {
    type: 'noul',
    instructions: 'The author of `prompt` needs a quick or real-time answer more than a thorough one.',
  },
  factual_precision: {
    type: 'score',
    instructions:
      'How much does a correct answer to `prompt` depend on exact facts, figures, citations or APIs that a model could hallucinate?',
    criteria: PRECISION_LEVELS,
  },
} as const

interface ChoiceAnswer<T extends string> {
  type: 'choice'
  choice: T
  confidence: number
}
interface ScoreAnswer {
  type: 'score'
  score: number
}
interface NoulAnswer {
  type: 'noul'
  noul: number
}
interface JevResponse {
  model: string
  answers: {
    category: ChoiceAnswer<TaskCategory>
    complexity: ScoreAnswer
    needs_reasoning: NoulAnswer
    output_size: ChoiceAnswer<OutputSize>
    latency_sensitive: NoulAnswer
    factual_precision: ScoreAnswer
  }
}

export class JevError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }

  get isAuthError() {
    return this.status === 401 || this.status === 403
  }
}

async function readErrorMessage(response: Response): Promise<string> {
  const body = await response.json().catch(() => null)
  const message = body?.detail?.message ?? body?.message ?? body?.error
  return typeof message === 'string' ? message : `Jev respondió ${response.status}`
}

export async function analyzeWithJev(prompt: string, apiKey: string, signal?: AbortSignal): Promise<PromptAnalysis> {
  const startedAt = performance.now()
  const state = { prompt: prompt.slice(0, JEV_STATE_MAX_CHARS) }
  const response = await fetch(JEV_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(apiKey && { Authorization: `Bearer ${apiKey}` }) },
    body: JSON.stringify({ state, model: JEV_MODEL, questions: QUESTIONS }),
    signal,
  })

  if (!response.ok) throw new JevError(await readErrorMessage(response), response.status)

  const { model, answers } = (await response.json()) as JevResponse
  return {
    engine: model,
    category: answers.category.choice,
    categoryConfidence: answers.category.confidence,
    complexity: clamp01(answers.complexity.score / (COMPLEXITY_LEVELS.length - 1)),
    needsReasoning: answers.needs_reasoning.noul,
    outputSize: answers.output_size.choice,
    latencySensitive: answers.latency_sensitive.noul,
    hallucinationRisk: clamp01(answers.factual_precision.score / (PRECISION_LEVELS.length - 1)),
    durationMs: performance.now() - startedAt,
  }
}
