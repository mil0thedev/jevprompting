import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { ANALYSIS_DEBOUNCE_MS } from '@/config'
import { countTokens } from '@/lib/tokenizer'
import { analyzeWithJev, JevError } from '@/services/jev'
import type { PromptAnalysis, PromptPayload } from '@/types/analysis'

export type JevStatus = 'idle' | 'analyzing' | 'online' | 'error'

export interface AnalysisError {
  message: string
  isAuthError: boolean
}

/** Sends the prompt to Jev automatically, debounced, every time the prompt or the API key changes. */
export function usePromptAnalysis(prompt: string, apiKey: string) {
  const deferredPrompt = useDeferredValue(prompt)
  const payload = useMemo<PromptPayload>(
    () => ({ text: deferredPrompt, characters: deferredPrompt.length, inputTokens: countTokens(deferredPrompt) }),
    [deferredPrompt],
  )

  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null)
  const [error, setError] = useState<AnalysisError | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const isEmpty = !deferredPrompt.trim()

  useEffect(() => {
    if (isEmpty) {
      setAnalysis(null)
      setError(null)
      setIsAnalyzing(false)
      return
    }
    const controller = new AbortController()
    setIsAnalyzing(true)

    const timer = setTimeout(async () => {
      try {
        setAnalysis(await analyzeWithJev(deferredPrompt, apiKey, controller.signal))
        setError(null)
      } catch (reason) {
        if (controller.signal.aborted) return
        setAnalysis(null)
        setError({
          message: reason instanceof Error ? reason.message : String(reason),
          isAuthError: reason instanceof JevError && reason.isAuthError,
        })
      }
      if (!controller.signal.aborted) setIsAnalyzing(false)
    }, ANALYSIS_DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [deferredPrompt, apiKey, isEmpty])

  const status: JevStatus = isAnalyzing ? 'analyzing' : error ? 'error' : analysis ? 'online' : 'idle'

  return { payload, analysis, error, status, isEmpty }
}
