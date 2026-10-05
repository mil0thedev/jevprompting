import { useCallback, useEffect, useState } from 'react'
import { fetchCatalog } from '@/services/openRouter'
import type { CatalogModel } from '@/types/model'

type CatalogState =
  | { status: 'loading'; models: CatalogModel[] }
  | { status: 'ready'; models: CatalogModel[] }
  | { status: 'error'; models: CatalogModel[]; error: string }

export function useModelCatalog() {
  const [state, setState] = useState<CatalogState>({ status: 'loading', models: [] })
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setState((prev) => ({ status: 'loading', models: prev.models }))
    fetchCatalog(controller.signal, { force: reloadCount > 0 }).then(
      (models) => setState({ status: 'ready', models }),
      (error: Error) => {
        if (!controller.signal.aborted) setState({ status: 'error', models: [], error: error.message })
      },
    )
    return () => controller.abort()
  }, [reloadCount])

  const reload = useCallback(() => setReloadCount((count) => count + 1), [])
  return { ...state, reload }
}
