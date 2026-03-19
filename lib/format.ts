export function fmt(v: number, decimals = 4): string {
  if (v === 0) return '0'
  const abs = Math.abs(v)
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000)     return `${(v / 1_000).toFixed(2)}K`
  return v.toFixed(decimals)
}

export function fmtPct(v: number): string {
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`
}

export function fmtSign(v: number, decimals = 3): string {
  return `${v >= 0 ? '+' : ''}${fmt(v, decimals)}`
}

export function shorten(addr: string, chars = 4): string {
  if (!addr || addr.length < chars * 2 + 3) return addr
  return `${addr.slice(0, chars)}…${addr.slice(-chars)}`
}

export function timeAgo(dateStr: string): string {
  if (!dateStr) return '—'
  const secs = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (isNaN(secs) || secs < 0) return '—'
  if (secs < 60)     return `${Math.floor(secs)}s`
  if (secs < 3600)   return `${Math.floor(secs / 60)}m`
  if (secs < 86400)  return `${Math.floor(secs / 3600)}h`
  if (secs < 604800) return `${Math.floor(secs / 86400)}d`
  return `${Math.floor(secs / 604800)}w`
}
