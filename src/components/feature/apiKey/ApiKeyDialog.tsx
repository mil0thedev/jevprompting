import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowUpRightFromSquare, Eye, EyeSlash, Key, Xmark } from '@gravity-ui/icons'
import { TYPESAFE_KEYS_URL } from '@/config'

interface ApiKeyDialogProps {
  apiKey: string
  onSave: (apiKey: string) => void
  onClose: () => void
}

/** Rendered only while open; uses the native <dialog> for focus trapping, Esc and backdrop. */
export function ApiKeyDialog({ apiKey, onSave, onClose }: ApiKeyDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [draft, setDraft] = useState(apiKey)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSave(draft)
    onClose()
  }

  const handleClear = () => {
    onSave('')
    onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      onClick={(event) => event.target === dialogRef.current && onClose()}
      aria-labelledby="api-key-title"
      className="m-auto w-full max-w-md rounded-xl border border-line bg-surface p-0 text-ink shadow-xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand-soft text-brand">
              <Key className="size-4" />
            </span>
            <h2 id="api-key-title" className="text-sm font-bold">
              API key de TypeSafe AI
            </h2>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-ink-3 hover:bg-hover hover:text-ink" aria-label="Cerrar">
            <Xmark className="size-4" />
          </button>
        </div>

        <p className="text-xs leading-relaxed text-ink-2">
          JevPrompting usa <strong className="text-ink">Jev</strong> para analizar tu prompt. Usa tu propia key: se guarda solo en
          este navegador y se envía a TypeSafe en cada análisis.
        </p>

        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] font-semibold tracking-wider text-ink-3 uppercase">API key</span>
          <span className="flex items-center rounded-md border border-line bg-canvas focus-within:border-brand focus-within:ring-1 focus-within:ring-brand">
            <input
              autoFocus
              type={isVisible ? 'text' : 'password'}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="ts_…"
              autoComplete="off"
              spellCheck={false}
              className="min-w-0 flex-1 bg-transparent px-3 py-2 font-mono text-xs text-ink outline-none placeholder:text-ink-3"
            />
            <button
              type="button"
              onClick={() => setIsVisible((visible) => !visible)}
              className="px-3 text-ink-3 hover:text-ink"
              aria-label={isVisible ? 'Ocultar key' : 'Mostrar key'}
            >
              {isVisible ? <EyeSlash className="size-4" /> : <Eye className="size-4" />}
            </button>
          </span>
        </label>

        <a
          href={TYPESAFE_KEYS_URL}
          target="_blank"
          rel="noreferrer"
          className="flex w-fit items-center gap-1 text-xs font-medium text-brand hover:underline"
        >
          Obtener una API key en console.typesafe.ai <ArrowUpRightFromSquare className="size-3" />
        </a>

        <div className="flex items-center justify-between border-t border-line-soft pt-4">
          {apiKey ? (
            <button type="button" onClick={handleClear} className="text-xs font-medium text-danger hover:underline">
              Borrar key
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded px-3 py-1.5 text-xs font-medium text-ink-2 hover:bg-hover">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!draft.trim()}
              className="rounded bg-brand px-3.5 py-1.5 text-xs font-medium text-on-brand shadow-sm hover:bg-brand-hover disabled:opacity-50"
            >
              Guardar
            </button>
          </div>
        </div>
      </form>
    </dialog>
  )
}
