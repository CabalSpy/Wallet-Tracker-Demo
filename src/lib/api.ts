import { API_BASE } from '../config';

/**
 * Thin wrapper around the CabalSpy REST API. Base URL is fixed; the API key is
 * passed per call as a query param (matching the production tracker) and never
 * stored on disk.
 */
export class ApiClient {
  constructor(private apiKey: string) {}

  async get<T = any>(path: string, params: Record<string, string | number | undefined>): Promise<T> {
    const url = new URL(API_BASE + path);
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    }
    url.searchParams.set('api_key', this.apiKey);
    const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
    const body = await res.json().catch(() => null);
    if (!res.ok || !body || body.success === false) {
      const msg = body?.error?.message || body?.error || `Request failed (${res.status})`;
      throw new Error(typeof msg === 'string' ? msg : 'Unknown error');
    }
    return body.data as T;
  }
}

/* ── Normalizers: guarantee every array/object the UI touches exists ── */

export function normalizeTracking(t: any): any {
  t = t || {};
  t.profile = t.profile || {};
  t.period_stats = t.period_stats || {};
  t.period_win_rate_distribution = t.period_win_rate_distribution || {};
  const ab = t.period_active_tokens || {};
  ab.tokens = ab.tokens || [];
  ab.active_tokens_count = ab.active_tokens_count ?? ab.tokens.length;
  ab.avg_position_size = ab.avg_position_size ?? 0;
  ab.still_holding_count = ab.still_holding_count ?? 0;
  t.period_active_tokens = ab;
  t.period_history_tokens = t.period_history_tokens || [];
  t.period_realized_pnl_chart = t.period_realized_pnl_chart || [];
  t.period_trades = t.period_trades || [];
  return t;
}

export function normalizeCalendar(c: any): any {
  if (!c) return null;
  c.months = c.months || [];
  for (const m of c.months) { m.dates = m.dates || []; m.month = m.month || {}; }
  return c;
}
