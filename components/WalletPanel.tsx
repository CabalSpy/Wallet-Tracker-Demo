'use client'

import { useEffect, useState, useCallback } from 'react'
import type { WalletTrackerData, Chain, Period } from '@/lib/api'
import { explorerTxUrl, explorerWalletUrl } from '@/lib/api'
import { fmt, fmtSign, fmtPct, shorten, timeAgo } from '@/lib/format'
import { Avatar } from './ui/Avatar'
import { SocialLinks } from './ui/SocialLinks'
import { ChainIcon } from './ui/ChainIcon'
import clsx from 'clsx'

interface Props {
  wallet:         string | null
  chain:          Chain
  period:         Period
  open:           boolean
  onClose:        () => void
  onPeriodChange: (p: Period) => void
}

const PERIODS: Period[] = ['6h', '1d', '7d', '30d']

export function WalletPanel({ wallet, chain, period, open, onClose, onPeriodChange }: Props) {
  const [data,    setData]    = useState<WalletTrackerData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [tab,     setTab]     = useState<'activity' | 'tokens'>('activity')
  const [copied,  setCopied]  = useState(false)

  const load = useCallback(async (w: string, p: Period) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/wallet?wallet=${encodeURIComponent(w)}&period=${p}`)
      if (!res.ok) throw new Error((await res.json() as { error?: string }).error ?? 'Failed')
      setData(await res.json() as WalletTrackerData)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (wallet && open) { setData(null); load(wallet, period) }
  }, [wallet, open, period, load])

  // Reset tab when new wallet opens
  useEffect(() => { if (open) setTab('activity') }, [open])

  // Escape key
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  const handlePeriod = (p: Period) => {
    onPeriodChange(p)
    if (wallet) load(wallet, p)
  }

  const copyAddress = () => {
    if (!profile?.wallet_address) return
    navigator.clipboard.writeText(profile.wallet_address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const profile  = data?.profile
  const stats    = data?.period_stats
  const trades   = data?.recent_trades  ?? []
  const tokens   = data?.token_overview ?? []
  const currency = profile?.currency ?? (chain === 'BASE' ? 'ETH' : chain === 'BNB' ? 'BNB' : 'SOL')
  const pnlPos   = (stats?.pnl ?? 0) >= 0

  if (!wallet) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          'fixed inset-0 z-40 transition-all duration-300',
          open
            ? 'bg-black/70 backdrop-blur-md pointer-events-auto'
            : 'bg-transparent pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* ── Centered modal ─────────────────────────────────────────────────── */}
      <div
        className={clsx(
          'fixed z-50 inset-0 flex items-center justify-center p-4 pointer-events-none'
        )}
      >
        <div
          className={clsx(
            'relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl',
            'border border-white/[0.08] pointer-events-auto',
            'transition-all duration-300',
            open
              ? 'opacity-100 scale-100 translate-y-0 animate-scale-in'
              : 'opacity-0 scale-95 translate-y-4'
          )}
          style={{ background: '#0b0e14', boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)' }}
        >

          {/* ── Modal header ────────────────────────────────────────── */}
          <div className="flex-shrink-0">

            {/* Top bar */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/[0.06]">
              {/* Chain + live */}
              <div className="flex items-center gap-2">
                <ChainIcon chain={chain} size={16} />
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted2)]">
                  Wallet Tracker
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-blink" />
              </div>

              {/* Period + close */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-0.5 p-0.5 rounded-lg"
                     style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {PERIODS.map(p => (
                    <button key={p} onClick={() => handlePeriod(p)}
                            className={clsx(
                              'px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all',
                              period === p ? 'text-white' : 'text-[var(--muted)] hover:text-[var(--text)]'
                            )}
                            style={period === p ? { background: 'rgba(255,255,255,0.09)' } : {}}>
                      {p}
                    </button>
                  ))}
                </div>

                <button onClick={onClose}
                        className="w-7 h-7 rounded-lg flex items-center justify-center
                                   text-[var(--muted)] hover:text-white hover:bg-white/5 transition-all">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Wallet identity */}
            {loading && !profile ? (
              <div className="px-5 py-4 flex items-center gap-3">
                <div className="skeleton w-12 h-12 rounded-full flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="skeleton h-4 w-36" />
                  <div className="skeleton h-3 w-28" />
                </div>
              </div>
            ) : profile ? (
              <div className="px-5 py-4 flex items-start gap-4">
                <Avatar src={profile.image_url} name={profile.name} size={48} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-display font-700 text-lg text-white leading-tight">
                      {profile.name || shorten(profile.wallet_address)}
                    </h2>
                    {profile.wallet_types?.map(t => (
                      <span key={t}
                            className="font-mono text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(0,214,143,0.09)', color: 'var(--accent)', border: '1px solid rgba(0,214,143,0.2)' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="font-mono text-[10px] text-[var(--muted2)]">
                      {shorten(profile.wallet_address, 7)}
                    </span>
                    <button onClick={copyAddress} title="Copy address"
                            className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors">
                      {copied
                        ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        : <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2"/></svg>
                      }
                    </button>
                    <a href={explorerWalletUrl(chain, profile.wallet_address)}
                       target="_blank" rel="noreferrer"
                       className="text-[var(--muted)] hover:text-[var(--text)] transition-colors">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </a>
                    <SocialLinks twitter={profile.twitter} telegram={profile.telegram}
                                 copytrade={profile.copytrade_link} />
                  </div>
                </div>
              </div>
            ) : null}

            {/* PNL stats bar */}
            {stats && (
              <div className="grid grid-cols-4 border-t border-white/[0.05]"
                   style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {[
                  { label: 'PNL',
                    main:  <span className={pnlPos ? 'pos' : 'neg'}>{fmtSign(stats.pnl, 2)}</span>,
                    sub:   <span className={pnlPos ? 'pos' : 'neg'}>{fmtPct(stats.pnl_percent)}</span> },
                  { label: `Invested`,
                    main:  <span className="text-[var(--text)]">{fmt(stats.buy, 2)}</span>,
                    sub:   <span className="text-[var(--muted2)]">{stats.buy_count} buys</span> },
                  { label: `Sold`,
                    main:  <span className="pos">{fmt(stats.sell, 2)}</span>,
                    sub:   <span className="text-[var(--muted2)]">{stats.sell_count} sells</span> },
                  { label: 'Total Txns',
                    main:  <span className="text-[var(--text)]">{stats.buy_count + stats.sell_count}</span>,
                    sub:   <span className="text-[var(--muted2)]">{currency}</span> },
                ].map(({ label, main, sub }) => (
                  <div key={label} className="px-4 py-3 text-center"
                       style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--muted)] mb-1">{label}</p>
                    <p className="font-mono text-sm font-500">{main}</p>
                    <p className="font-mono text-[10px] mt-0.5">{sub}</p>
                  </div>
                ))}
              </div>
            )}

            {loading && !stats && (
              <div className="grid grid-cols-4 border-t border-white/[0.05]">
                {[0,1,2,3].map(i => (
                  <div key={i} className="px-4 py-3 space-y-2">
                    <div className="skeleton h-2 w-14 mx-auto rounded" />
                    <div className="skeleton h-4 w-16 mx-auto rounded" />
                    <div className="skeleton h-2 w-10 mx-auto rounded" />
                  </div>
                ))}
              </div>
            )}

            {/* Tabs */}
            <div className="flex">
              {(['activity', 'tokens'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                        className={clsx(
                          'flex-1 py-3 font-mono text-[10px] uppercase tracking-widest transition-colors border-b-2',
                          tab === t
                            ? 'text-[var(--accent)] border-[var(--accent)]'
                            : 'text-[var(--muted)] hover:text-[var(--text)] border-transparent'
                        )}>
                  {t === 'activity'
                    ? `Activity${trades.length ? ` (${trades.length})` : ''}`
                    : `Tokens${tokens.length   ? ` (${tokens.length})`  : ''}`}
                </button>
              ))}
            </div>
          </div>

          {/* ── Scrollable body ──────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto min-h-0">

            {error && (
              <div className="p-6 text-center space-y-3">
                <p className="font-mono text-sm text-[var(--sell)]">⚠ {error}</p>
                <button onClick={() => wallet && load(wallet, period)}
                        className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent)] hover:underline">
                  Retry
                </button>
              </div>
            )}

            {loading && (
              <div className="p-4 space-y-1.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="skeleton h-11 rounded-lg" style={{ animationDelay: `${i * 45}ms` }} />
                ))}
              </div>
            )}

            {/* Activity tab */}
            {!loading && !error && tab === 'activity' && (
              <>
                <div className="grid px-5 py-2 sticky top-0 text-[9px] font-mono uppercase
                                tracking-widest text-[var(--muted)] border-b border-white/[0.04]"
                     style={{ background: '#0b0e14', gridTemplateColumns: '56px 1fr 88px 52px 28px' }}>
                  <span>Type</span><span>Token</span>
                  <span className="text-right">Value</span>
                  <span className="text-right">When</span>
                  <span/>
                </div>

                {trades.length === 0 ? (
                  <p className="py-10 text-center font-mono text-sm text-[var(--muted2)]">
                    No trades in this period
                  </p>
                ) : trades.map((t, i) => {
                  const isBuy  = t.transaction_type === 'buy'
                  const isSell = t.transaction_type === 'sell'
                  return (
                    <div key={t.signature + i}
                         className="grid items-center px-5 py-3 border-b border-white/[0.03]
                                    hover:bg-white/[0.015] transition-colors"
                         style={{ gridTemplateColumns: '56px 1fr 88px 52px 28px' }}>
                      <span className={clsx(
                        'font-mono text-xs font-600 uppercase',
                        isBuy ? 'pos' : isSell ? 'neg' : 'text-[var(--muted2)]'
                      )}>
                        {t.transaction_type}
                      </span>
                      <div className="min-w-0 pr-2">
                        <p className="font-500 text-sm text-[var(--text)] truncate leading-tight">
                          {t.token_symbol || shorten(t.mint, 4)}
                        </p>
                        <p className="font-mono text-[9px] text-[var(--muted)] truncate">
                          {shorten(t.mint, 4)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-xs text-[var(--text)]">
                          {fmt(t.value, 3)}
                        </p>
                        <p className="font-mono text-[9px] text-[var(--muted2)]">
                          {t.currency || currency}
                        </p>
                      </div>
                      <p className="font-mono text-[10px] text-[var(--muted2)] text-right">
                        {timeAgo(t.created_at)}
                      </p>
                      <div className="flex justify-end">
                        {t.signature && (
                          <a href={explorerTxUrl(chain, t.signature)} target="_blank" rel="noreferrer"
                             onClick={e => e.stopPropagation()}
                             className="text-[var(--muted)] hover:text-[var(--text)] transition-colors">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })}
              </>
            )}

            {/* Tokens tab */}
            {!loading && !error && tab === 'tokens' && (
              <>
                <div className="grid px-5 py-2 sticky top-0 text-[9px] font-mono uppercase
                                tracking-widest text-[var(--muted)] border-b border-white/[0.04]"
                     style={{ background: '#0b0e14', gridTemplateColumns: '1fr 80px 80px 70px' }}>
                  <span>Token</span>
                  <span className="text-right">PNL</span>
                  <span className="text-right">Invested</span>
                  <span className="text-right">Last Active</span>
                </div>

                {tokens.length === 0 ? (
                  <p className="py-10 text-center font-mono text-sm text-[var(--muted2)]">
                    No tokens in this period
                  </p>
                ) : tokens.map((tok, i) => {
                  const tp = tok.pnl >= 0
                  return (
                    <div key={tok.mint + i}
                         className="grid items-center px-5 py-3 border-b border-white/[0.03]
                                    hover:bg-white/[0.015] transition-colors"
                         style={{ gridTemplateColumns: '1fr 80px 80px 70px' }}>
                      <div className="min-w-0 pr-3">
                        <p className="font-500 text-sm text-[var(--text)] truncate">
                          {tok.token_symbol || shorten(tok.mint, 4)}
                        </p>
                        {tok.held > 0 && (
                          <p className="font-mono text-[9px] text-[var(--muted2)]">
                            Bag {tok.bag_pct?.toFixed(1)}%
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className={clsx('font-mono text-xs', tp ? 'pos' : 'neg')}>
                          {fmtSign(tok.pnl, 2)}
                        </p>
                        <p className={clsx('font-mono text-[9px]', tp ? 'pos' : 'neg')}>
                          {fmtPct(tok.pnl_percent)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-xs text-[var(--text)]">{fmt(tok.invested, 2)}</p>
                        <p className="font-mono text-[9px] text-[var(--muted2)]">{tok.currency || currency}</p>
                      </div>
                      <p className="font-mono text-[10px] text-[var(--muted2)] text-right">
                        {timeAgo(tok.last_active)}
                      </p>
                    </div>
                  )
                })}
              </>
            )}
          </div>

          {/* ── Footer ──────────────────────────────────────────── */}
          <div className="flex-shrink-0 px-5 py-3 border-t border-white/[0.05] text-center"
               style={{ background: 'rgba(0,0,0,0.25)' }}>
            <p className="font-mono text-[9px] text-[var(--muted)] uppercase tracking-widest">
              Powered by{' '}
              <a href="https://cabalspy.xyz" target="_blank" rel="noreferrer"
                 className="text-[var(--accent)] hover:underline">CabalSpy API</a>
              {' '}·{' '}
              <a href="https://apidashboard.cabalspy.xyz" target="_blank" rel="noreferrer"
                 className="text-[var(--accent)] hover:underline">Get your API key</a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
