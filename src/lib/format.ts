const integer = new Intl.NumberFormat('en-US')

export const formatInteger = (value: number) => integer.format(Math.round(value))

export const formatPercent = (ratio: number, digits = 1) => `${(ratio * 100).toFixed(digits)}%`

export function formatUsd(value: number): string {
  if (value === 0) return '$0'
  if (value < 0.0001) return `$${value.toExponential(1)}`
  const digits = value < 0.01 ? 5 : value < 1 ? 4 : 2
  return `$${value.toFixed(digits)}`
}

export const formatPerMillion = (perToken: number) => `$${(perToken * 1_000_000).toFixed(2)}/M`

export function formatLatency(ms: number): string {
  return ms >= 1000 ? `~${(ms / 1000).toFixed(1)}s` : `~${formatInteger(ms)}ms`
}

export function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(tokens % 1_000_000 ? 1 : 0)}M`
  if (tokens >= 10_000) return `${Math.round(tokens / 1000)}k`
  if (tokens >= 1000) return `${(Math.floor(tokens / 100) / 10).toString()}k`
  return formatInteger(tokens)
}

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
