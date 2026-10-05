import type { ComponentType, SVGProps } from 'react'
import { ArrowsRotateRight, CircleCheck, CircleExclamation, Hourglass, Key, Moon, Route, Sun } from '@gravity-ui/icons'
import { APP_NAME } from '@/config'
import type { JevStatus } from '@/hooks/usePromptAnalysis'
import type { Theme } from '@/hooks/useTheme'

interface AppHeaderProps {
  jevStatus: JevStatus
  jevError: string | null
  isAuthError: boolean
  engine: string | null
  catalogStatus: 'loading' | 'ready' | 'error'
  modelCount: number
  hasApiKey: boolean
  onOpenApiKey: () => void
  theme: Theme
  onToggleTheme: () => void
}

interface Badge {
  className: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  label: (engine: string | null) => string
}

const JEV_BADGE: Record<JevStatus, Badge> = {
  online: {
    className: 'bg-ok-soft border-ok-line text-ok',
    Icon: CircleCheck,
    label: () => 'Jev',
  },
  analyzing: {
    className: 'bg-brand-soft border-brand-line text-brand',
    Icon: ArrowsRotateRight,
    label: () => 'Analizando…',
  },
  idle: {
    className: 'bg-hover border-line text-ink-2',
    Icon: Hourglass,
    label: () => 'Jev en espera',
  },
  error: {
    className: 'bg-danger-soft border-danger-line text-danger',
    Icon: CircleExclamation,
    label: () => 'Jev no disponible',
  },
}

const MISSING_KEY_BADGE: Badge = {
  className: 'bg-warn-soft border-warn-line text-warn',
  Icon: Key,
  label: () => 'Ingresar API key',
}

const INVALID_KEY_BADGE: Badge = {
  className: 'bg-danger-soft border-danger-line text-danger',
  Icon: Key,
  label: () => 'API key inválida',
}

/** Without a working key the status badge turns into the call to action for entering one. */
function pickBadge(status: JevStatus, hasApiKey: boolean, isAuthError: boolean): Badge {
  if (isAuthError) return hasApiKey ? INVALID_KEY_BADGE : MISSING_KEY_BADGE
  if (!hasApiKey && status === 'idle') return MISSING_KEY_BADGE
  return JEV_BADGE[status]
}

export function AppHeader({
  jevStatus,
  jevError,
  isAuthError,
  engine,
  catalogStatus,
  modelCount,
  hasApiKey,
  onOpenApiKey,
  theme,
  onToggleTheme,
}: AppHeaderProps) {
  const badge = pickBadge(jevStatus, hasApiKey, isAuthError)
  const isCallToAction = badge === MISSING_KEY_BADGE || badge === INVALID_KEY_BADGE
  const catalogLabel =
    catalogStatus === 'loading' ? 'Cargando catálogo…' : catalogStatus === 'error' ? 'Catálogo sin conexión' : `${modelCount} modelos`
  const isDark = theme === 'dark'

  return (
    <header className="z-10 flex shrink-0 items-center justify-between border-b border-line bg-surface px-6 py-2 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-brand-soft text-brand">
          <Route className="size-[18px]" />
        </div>
        <h1 className="font-mono text-sm font-semibold">{APP_NAME}</h1>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenApiKey}
          title={isCallToAction ? (jevError ?? 'Ingresar API key de TypeSafe') : 'Cambiar o borrar la API key de TypeSafe'}
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition hover:brightness-95 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none dark:hover:brightness-125 ${badge.className} ${isCallToAction ? 'shadow-sm' : ''}`}
        >
          <badge.Icon className={`size-3.5 ${jevStatus === 'analyzing' && !isCallToAction ? 'animate-spin' : ''}`} />
          <span>{badge.label(engine)}</span>
        </button>
        <div className="flex items-center gap-1.5 font-mono text-xs text-ink-2">
          <span
            className={`size-1.5 rounded-full ${catalogStatus === 'ready' ? 'bg-ok' : catalogStatus === 'error' ? 'bg-danger' : 'bg-ink-3'}`}
          />
          <span>OpenRouter</span>
          <span className="text-ink-3">·</span>
          <span className="text-ink-3">{catalogLabel}</span>
        </div>
        <span className="h-5 w-px bg-line" />
        <button
          type="button"
          onClick={onToggleTheme}
          className="flex items-center rounded-md border border-line p-1.5 text-ink-2 transition-colors hover:bg-hover hover:text-ink"
          aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
          title={isDark ? 'Modo claro' : 'Modo oscuro'}
        >
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
      </div>
    </header>
  )
}
