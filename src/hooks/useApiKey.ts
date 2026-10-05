import { useCallback, useState } from 'react'
import { API_KEY_STORAGE_KEY } from '@/config'
import { readStorage, writeStorage } from '@/lib/storage'

/** The user's own TypeSafe API key, persisted only in this browser. */
export function useApiKey() {
  const [apiKey, setApiKeyState] = useState(() => readStorage(API_KEY_STORAGE_KEY) ?? '')

  const setApiKey = useCallback((value: string) => {
    const trimmed = value.trim()
    writeStorage(API_KEY_STORAGE_KEY, trimmed || null)
    setApiKeyState(trimmed)
  }, [])

  return [apiKey, setApiKey] as const
}
