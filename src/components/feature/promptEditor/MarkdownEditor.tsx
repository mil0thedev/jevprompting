import CodeMirror from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'

// Colors reference the CSS theme variables so the editor follows light/dark mode automatically.
const highlightStyle = HighlightStyle.define([
  { tag: t.heading, color: 'var(--color-accent)', fontWeight: '600' },
  { tag: t.strong, fontWeight: '700' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.monospace, color: 'var(--color-ok)' },
  { tag: [t.link, t.url], color: 'var(--color-brand)' },
  { tag: t.quote, color: 'var(--color-ink-2)', fontStyle: 'italic' },
  { tag: [t.processingInstruction, t.contentSeparator], color: 'var(--color-brand)', fontWeight: '600' },
])

const editorTheme = EditorView.theme({
  '&': { height: '100%', fontSize: '13px', backgroundColor: 'var(--color-surface)', color: 'var(--color-ink)' },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': { fontFamily: "'JetBrains Mono', monospace", lineHeight: '1.75' },
  '.cm-content': { padding: '20px 0', caretColor: 'var(--color-brand)' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--color-brand)' },
  '.cm-line': { padding: '0 24px 0 16px' },
  '.cm-gutters': {
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-ink-3)',
    borderRight: '1px solid var(--color-line-soft)',
    paddingLeft: '16px',
  },
  '.cm-activeLine': { backgroundColor: 'var(--color-canvas)' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--color-ink)' },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground': {
    backgroundColor: 'color-mix(in srgb, var(--color-brand) 28%, transparent)',
  },
  '.cm-placeholder': { color: 'var(--color-ink-3)' },
})

const extensions = [markdown(), syntaxHighlighting(highlightStyle), EditorView.lineWrapping, editorTheme]

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      height="100%"
      className="h-full"
      theme="none"
      extensions={extensions}
      placeholder="Escribe o pega tu prompt en Markdown…"
      basicSetup={{ foldGutter: false, autocompletion: false, highlightActiveLine: true }}
      aria-label="Editor de prompt en Markdown"
    />
  )
}
