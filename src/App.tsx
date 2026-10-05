import { useMemo, useState } from 'react'
import { DEFAULT_PROMPT } from '@/config'
import { AppHeader } from '@/components/layout/AppHeader'
import { ApiKeyDialog } from '@/components/feature/apiKey/ApiKeyDialog'
import { PromptEditorPanel } from '@/components/feature/promptEditor/PromptEditorPanel'
import { ModelVerdictPanel } from '@/components/feature/modelVerdict/ModelVerdictPanel'
import { useApiKey } from '@/hooks/useApiKey'
import { useModelCatalog } from '@/hooks/useModelCatalog'
import { usePromptAnalysis } from '@/hooks/usePromptAnalysis'
import { useTheme } from '@/hooks/useTheme'
import { rankModels } from '@/services/modelRanker'

export default function App() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT)
  const [apiKey, setApiKey] = useApiKey()
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const catalog = useModelCatalog()
  const { payload, analysis, error, status, isEmpty } = usePromptAnalysis(prompt, apiKey)

  const ranked = useMemo(
    () => (isEmpty || !analysis ? [] : rankModels(catalog.models, payload, analysis)),
    [isEmpty, catalog.models, payload, analysis],
  )
  const openApiKey = () => setIsApiKeyOpen(true)

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <AppHeader
        jevStatus={status}
        jevError={error?.message ?? null}
        isAuthError={error?.isAuthError ?? false}
        engine={analysis?.engine ?? null}
        catalogStatus={catalog.status}
        modelCount={catalog.models.length}
        hasApiKey={Boolean(apiKey)}
        onOpenApiKey={openApiKey}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <main className="grid flex-1 grid-cols-12 overflow-hidden">
        <PromptEditorPanel
          prompt={prompt}
          onPromptChange={setPrompt}
          payload={payload}
          analysis={analysis}
          status={status}
          error={error?.message ?? null}
        />
        <ModelVerdictPanel
          ranked={ranked}
          analysis={analysis}
          jevError={error}
          isEmpty={isEmpty}
          hasApiKey={Boolean(apiKey)}
          onOpenApiKey={openApiKey}
          catalogStatus={catalog.status}
          catalogError={catalog.status === 'error' ? catalog.error : null}
          onReloadCatalog={catalog.reload}
        />
      </main>
      {isApiKeyOpen && <ApiKeyDialog apiKey={apiKey} onSave={setApiKey} onClose={() => setIsApiKeyOpen(false)} />}
    </div>
  )
}
