/**
 * CabalSpy API Client
 * Docs: https://cabalspy.gitbook.io/cabalspy-docs
 *
 * NOTE: The normaliseLeaderboard function maps ALL known field name
 * variants from the API to a consistent internal type. This ensures
 * data displays correctly regardless of slight API differences per chain.
 */

const API_BASE = process.env.CABALSPY_API_BASE || 'https://api.cabalspy.xyz'
const API_KEY  = process.env.CABALSPY_API_KEY  || ''

// ─── Types ────────────────────────────────────────────────────────────────────

export type Chain    = 'SOL' | 'BNB' | 'BASE'
export type Category = 'KOL' | 'Smart'
export type Period   = '6h' | '1d' | '7d' | '30d'

export interface LeaderboardEntry {
  rank:            number
  wallet:          string
  name:            string
  image_url:       string
  twitter?:        string
  telegram?:       string
  copytrade_link?: string
  // PNL in native currency (SOL / BNB / ETH)
  pnl:             number
  pnl_percent:     number
  // Volume in native currency
  buy:             number
  sell:            number
  buy_count:       number
  sell_count:      number
  winrate?:        number
  chain:           Chain
  category:        Category
}

export interface WalletProfile {
  wallet_address:  string
  name:            string
  image_url:       string
  twitter?:        string
  telegram?:       string
  copytrade_link?: string
  chain:           Chain
  currency:        string
  wallet_types:    string[]
}

export interface PeriodStats {
  period:      string
  currency:    string
  buy:         number
  sell:        number
  pnl:         number
  pnl_percent: number
  buy_count:   number
  sell_count:  number
}

export interface RecentTrade {
  signature:        string
  token_symbol:     string
  mint:             string
  transaction_type: string
  value:            number
  currency:         string
  wallet_type:      string
  created_at:       string
}

export interface TokenOverview {
  mint:         string
  token_symbol: string
  // API returns "invested" and "sold" (not buy/sell)
  invested:     number
  sold:         number
  pnl:          number
  pnl_percent:  number
  currency:     string
  held:         number
  peak:         number
  bag_pct:      number
  supply_pct:   number
  last_active:  string
}

export interface WalletTrackerData {
  profile:        WalletProfile
  period_stats:   PeriodStats
  recent_trades:  RecentTrade[]
  token_overview: TokenOverview[]
}

// ─── Helper: safely read a number from multiple possible field names ──────────

function pickNum(obj: Record<string, unknown>, ...keys: string[]): number {
  for (const k of keys) {
    const v = obj[k]
    if (v !== undefined && v !== null && v !== '') {
      const n = Number(v)
      if (!isNaN(n)) return n
    }
  }
  return 0
}

function pickStr(obj: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = obj[k]
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v)
  }
  return ''
}

// ─── Leaderboard endpoint map ─────────────────────────────────────────────────

function leaderboardEndpoint(chain: Chain, category: Category): string {
  const map: Record<string, string> = {
    'SOL-KOL':    '/api/stats/leaderboard',
    'SOL-Smart':  '/api/stats/Smart_leaderboard',
    'BNB-KOL':    '/api/stats/leaderboard_bnb',
    'BNB-Smart':  '/api/stats/SmartBnb_leaderboard',
    'BASE-KOL':   '/api/stats/leaderboard_base',
    'BASE-Smart': '/api/stats/SmartBase_leaderboard',
  }
  return map[`${chain}-${category}`] ?? '/api/stats/leaderboard'
}

// ─── Normalise leaderboard response ──────────────────────────────────────────
// The API may return different field names depending on chain/category.
// We try every known variant so data always displays correctly.

function normaliseLeaderboard(
  raw: unknown,
  chain: Chain,
  category: Category
): LeaderboardEntry[] {
  // Extract array from response (may be direct array or wrapped)
  let arr: Record<string, unknown>[] = []
  if (Array.isArray(raw)) {
    arr = raw as Record<string, unknown>[]
  } else if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    // Try common wrapper keys
    for (const key of ['data', 'results', 'leaderboard', 'entries', 'wallets']) {
      if (Array.isArray(obj[key])) {
        arr = obj[key] as Record<string, unknown>[]
        break
      }
    }
    // If still empty, maybe the object itself is a single entry
    if (arr.length === 0 && obj.wallet) arr = [obj]
  }

  return arr.map((e, i) => {
    // ── Exact field names from build_and_cache_leaderboard() ─────────────
    // PNL field differs per chain:
    //   SOL  → pnl_sol   BNB → pnl_bnb   BASE → pnl_eth
    const pnl = pickNum(e, 'pnl_sol', 'pnl_bnb', 'pnl_eth', 'pnl')
    const pnl_percent = pickNum(e, 'pnl_percent', 'roi')

    // Leaderboard stores total_volume (buy+sell), not separate buy/sell.
    // We approximate buy/sell from volume × count ratio for display.
    const total_volume = pickNum(e, 'total_volume', 'volume')
    const buy_count    = pickNum(e, 'buy_count', 'buys')
    const sell_count   = pickNum(e, 'sell_count', 'sells')
    const total_count  = buy_count + sell_count || 1
    const buy  = buy_count  > 0 ? total_volume * buy_count  / total_count : 0
    const sell = sell_count > 0 ? total_volume * sell_count / total_count : 0

    const winrate_raw = pickNum(e, 'winrate', 'win_rate')
    const winrate     = winrate_raw > 0 ? winrate_raw : undefined

    return {
      rank:  pickNum(e, 'rank') || i + 1,
      // Real key is wallet_address (not wallet)
      wallet: pickStr(e, 'wallet_address', 'wallet', 'address'),
      name:   pickStr(e, 'name', 'trader_name'),
      image_url: pickStr(e, 'image_url', 'avatar', 'pfp'),
      twitter:        pickStr(e, 'twitter')        || undefined,
      telegram:       pickStr(e, 'telegram')       || undefined,
      copytrade_link: pickStr(e, 'copytrade_link') || undefined,
      pnl,
      pnl_percent,
      buy,
      sell,
      buy_count,
      sell_count,
      winrate,
      chain,
      category,
    }
  })
}

// ─── Fetch helper ─────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  if (!API_KEY) throw new Error('CABALSPY_API_KEY is not configured')
  const url = new URL(`${API_BASE}${path}`)
  url.searchParams.set('api_key', API_KEY)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), { next: { revalidate: 30 } })
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, string>
    throw new Error(body.error ?? `API ${res.status} — ${path}`)
  }
  return res.json() as Promise<T>
}

// ─── Public API functions ─────────────────────────────────────────────────────

export async function fetchLeaderboard(
  chain: Chain,
  category: Category,
  period: Period = '1d'
): Promise<LeaderboardEntry[]> {
  const raw = await apiFetch<unknown>(leaderboardEndpoint(chain, category), { period })
  return normaliseLeaderboard(raw, chain, category)
}

export async function fetchWalletTracker(
  wallet: string,
  period: Period = '1d'
): Promise<WalletTrackerData> {
  return apiFetch<WalletTrackerData>('/api/wallet/tracker', { wallet, period })
}

// ─── URL helpers ──────────────────────────────────────────────────────────────

export function explorerTxUrl(chain: Chain, sig: string): string {
  if (chain === 'SOL')  return `https://solscan.io/tx/${sig}`
  if (chain === 'BASE') return `https://basescan.org/tx/${sig}`
  return `https://bscscan.com/tx/${sig}`
}

export function explorerWalletUrl(chain: Chain, addr: string): string {
  if (chain === 'SOL')  return `https://solscan.io/account/${addr}`
  if (chain === 'BASE') return `https://basescan.org/address/${addr}`
  return `https://bscscan.com/address/${addr}`
}

export function chainCurrency(chain: Chain): string {
  if (chain === 'BASE') return 'ETH'
  if (chain === 'BNB')  return 'BNB'
  return 'SOL'
}

// ─── Debug: log raw API response (only server-side, only in dev) ──────────────
export async function debugLeaderboard(chain: Chain, category: Category, period: Period) {
  const raw = await apiFetch<unknown>(leaderboardEndpoint(chain, category), { period })
  if (process.env.NODE_ENV === 'development') {
    const arr = Array.isArray(raw) ? raw : [raw]
    if (arr[0]) console.log('[CabalSpy DEBUG] First entry keys:', Object.keys(arr[0] as object))
  }
  return raw
}
