import { TrashBin } from '@gravity-ui/icons'
import type { JevStatus } from '@/hooks/usePromptAnalysis'
import type { PromptAnalysis, PromptPayload } from '@/types/analysis'
import { AnalysisSummary } from './AnalysisSummary'
import { MarkdownEditor } from './MarkdownEditor'
import { PromptStatsBar } from './PromptStatsBar'

interface PromptEditorPanelProps {
  prompt: string
  onPromptChange: (value: string) => void
  payload: PromptPayload
  analysis: PromptAnalysis | null
  status: JevStatus
  error: string | null
}

export function PromptEditorPanel({ prompt, onPromptChange, payload, analysis, status, error }: PromptEditorPanelProps) {
  return (
    <section className="col-span-12 flex h-full flex-col overflow-hidden border-r border-line bg-surface lg:col-span-7">
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-line-soft px-6">
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="flex items-center gap-1.5 font-semibold">
            Entrada de Prompt
          </span>
          <span className="text-ink-3">.md</span>
        </div>
        <button
          type="button"
          className="rounded-md p-1.5 text-ink-2 transition-colors hover:bg-danger-soft hover:text-danger"
          onClick={() => onPromptChange('')}
          title="Limpiar"
          aria-label="Limpiar prompt"
        >
          <TrashBin className="size-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1">
        <MarkdownEditor value={prompt} onChange={onPromptChange} />
      </div>

      <PromptStatsBar payload={payload} analysis={analysis} status={status} error={error} />
      <AnalysisSummary analysis={analysis} />
    </section>
  )
}
