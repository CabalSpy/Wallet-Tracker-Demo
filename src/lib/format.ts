/** Display formatting, mirroring the production tracker (fmtUsd/fmtNat/fmtHold/timeAgo). */

export function fmtUsd(v: number | null | undefined): string {
  const n = Number(v) || 0;
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
export function fmtUsdSigned(v: number | null | undefined): string {
  const n = Number(v) || 0;
  const s = n < 0 ? '-' : n > 0 ? '+' : '';
  return s + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
/** Compact USD for very large headline numbers ($1.81M). */
export function fmtUsdCompact(v: number | null | undefined): string {
  const n = Number(v) || 0, a = Math.abs(n), sign = n < 0 ? '-' : '';
  if (a >= 1e9) return sign + '$' + (a / 1e9).toFixed(2) + 'B';
  if (a >= 1e6) return sign + '$' + (a / 1e6).toFixed(2) + 'M';
  if (a >= 1e3) return sign + '$' + (a / 1e3).toFixed(1) + 'K';
  return sign + '$' + a.toFixed(2);
}
export function fmtUsdCompactSigned(v: number | null | undefined): string {
  const n = Number(v) || 0;
  return (n > 0 ? '+' : '') + fmtUsdCompact(n);
}
export function fmtNat(v: number | null | undefined): string {
  return (Number(v) || 0).toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}
export function fmtNatSigned(v: number | null | undefined): string {
  const n = Number(v) || 0;
  return (n >= 0 ? '+' : '') + n.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}
export function fmtTokens(v: number | null | undefined): string {
  const n = Number(v) || 0, a = Math.abs(n);
  if (a >= 1e6) return (n / 1e6).toFixed(2) + 'm';
  if (a >= 1e3) return (n / 1e3).toFixed(2) + 'k';
  return String(Math.round(n * 10000) / 10000);
}
export function fmtHold(mins: number | null | undefined): string {
  const m = Number(mins) || 0;
  if (m <= 0) return '—';
  if (m < 60) return Math.round(m) + 'm';
  const h = Math.floor(m / 60), rem = Math.round(m - h * 60);
  if (h < 24) return `${h}h ${rem}m`;
  const d = Math.floor(h / 24), h2 = h - d * 24;
  return `${d}d ${h2}h`;
}
export function pct(v: number | null | undefined, signed = false): string {
  const n = Number(v);
  if (!isFinite(n)) return '';
  return (signed && n > 0 ? '+' : '') + n.toFixed(2) + '%';
}
export function timeAgo(input: string | number | null | undefined): string {
  if (!input) return '';
  const t = typeof input === 'number' ? (input < 1e12 ? input * 1000 : input) : Date.parse(input);
  if (isNaN(t)) return '';
  let diff = Math.floor((Date.now() - t) / 1000);
  if (diff < 0) return 'now';
  if (diff < 60) return diff + 's ago';
  if (diff < 3600) return Math.round(diff / 60) + 'm ago';
  if (diff < 86400) return Math.round(diff / 3600) + 'h ago';
  if (diff < 604800) return Math.round(diff / 86400) + 'd ago';
  if (diff < 2419200) return Math.round(diff / 604800) + 'w ago';
  return Math.round(diff / 2419200) + 'mo ago';
}
export function shortenAddress(a: string | null | undefined): string {
  return a && a.length >= 8 ? a.slice(0, 4) + '…' + a.slice(-4) : (a || '?');
}
export function escapeHtml(s: unknown): string {
  return String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
}
