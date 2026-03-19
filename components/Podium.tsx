'use client'

import type { LeaderboardEntry, Chain } from '@/lib/api'
import { chainCurrency } from '@/lib/api'
import { fmt, fmtSign, fmtPct, shorten } from '@/lib/format'
import { Avatar } from './ui/Avatar'
import { SocialLinks } from './ui/SocialLinks'
import { ChainIcon } from './ui/ChainIcon'
import clsx from 'clsx'

interface Props {
  entries:  LeaderboardEntry[]
  loading:  boolean
  chain:    Chain
  onSelect: (wallet: string) => void
}

export function Podium({ entries, loading, chain, onSelect }: Props) {
  const currency = chainCurrency(chain)

  if (loading) {
    return (
      <div className="mb-6 space-y-4">
        <div className="skeleton h-52 rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          <div className="skeleton h-44 rounded-2xl" />
          <div className="skeleton h-44 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!entries.length) return null

  const first  = entries[0]
  const second = entries[1]
  const third  = entries[2]

  return (
    <div className="mb-6 space-y-4">
      {/* Label */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted2)]">Top Traders</span>
        <div className="flex-1 h-px bg-white/5" />
        <div className="flex items-center gap-1.5">
          <ChainIcon chain={chain} size={12} />
          <span className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest">{currency}</span>
        </div>
      </div>

      {/* #1 — full width top */}
      {first && (
        <PodiumCard
          entry={first}
          rank={1}
          currency={currency}
          chain={chain}
          size="large"
          onSelect={() => onSelect(first.wallet)}
        />
      )}

      {/* #2 and #3 — side by side below */}
      {(second || third) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {second && (
            <PodiumCard
              entry={second}
              rank={2}
              currency={currency}
              chain={chain}
              size="small"
              onSelect={() => onSelect(second.wallet)}
            />
          )}
          {third && (
            <PodiumCard
              entry={third}
              rank={3}
              currency={currency}
              chain={chain}
              size="small"
              onSelect={() => onSelect(third.wallet)}
            />
          )}
        </div>
      )}
    </div>
  )
}

function PodiumCard({
  entry, rank, currency, chain, size, onSelect,
}: {
  entry:    LeaderboardEntry
  rank:     number
  currency: string
  chain:    Chain
  size:     'large' | 'small'
  onSelect: () => void
}) {
  const pnlPos   = entry.pnl >= 0
  const isLarge  = size === 'large'
  const medals   = ['', '#FFD700', '#C0C0C0', '#CD7F32']
  const medLabel = ['', '1st', '2nd', '3rd']

  return (
    <button
      onClick={onSelect}
      className={clsx(
        'group relative w-full text-left rounded-2xl transition-all duration-200 focus:outline-none',
        rank === 1
          ? 'border border-[var(--accent)]/30 hover:border-[var(--accent)]/50'
          : 'border border-white/[0.06] hover:border-white/[0.12]'
      )}
      style={{
        padding: isLarge ? '24px 28px' : '18px 22px',
        background: rank === 1
          ? 'linear-gradient(135deg, rgba(0,214,143,0.07) 0%, rgba(13,16,23,0.97) 55%)'
          : 'rgba(13,16,23,0.9)',
        boxShadow: rank === 1 ? '0 0 48px rgba(0,214,143,0.07)' : 'none',
      }}
    >
      {/* Rank badge top-right */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5">
        <span className="font-mono text-[10px] uppercase tracking-wider"
              style={{ color: medals[rank] }}>
          {medLabel[rank]}
        </span>
        <span className="w-2 h-2 rounded-full inline-block"
              style={{ background: medals[rank], opacity: 0.75 }} />
      </div>

      {/* Avatar + name */}
      <div className={clsx('flex items-center gap-3', isLarge ? 'mb-5' : 'mb-4')}>
        <Avatar
          src={entry.image_url}
          name={entry.name}
          size={isLarge ? 56 : 42}
        />
        <div className="min-w-0 flex-1">
          <p className={clsx(
            'font-display font-700 text-white leading-tight truncate',
            isLarge ? 'text-xl' : 'text-base'
          )}>
            {entry.name || shorten(entry.wallet)}
          </p>
          <p className="font-mono text-[10px] text-[var(--muted2)] mt-0.5">
            {shorten(entry.wallet, 5)}
          </p>
          <SocialLinks
            twitter={entry.twitter}
            telegram={entry.telegram}
            copytrade={entry.copytrade_link}
            className="mt-1.5"
          />
        </div>
      </div>

      {/* PNL */}
      <div className="mb-4">
        <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--muted)] mb-1">
          PNL · {currency}
        </p>
        <div className="flex items-baseline gap-2">
          <p className={clsx(
            'font-display font-700 leading-none',
            isLarge ? 'text-3xl' : 'text-2xl',
            pnlPos ? 'pos' : 'neg'
          )}>
            {fmtSign(entry.pnl, 2)}
          </p>
          <p className={clsx('font-mono text-xs', pnlPos ? 'pos' : 'neg')}>
            {fmtPct(entry.pnl_percent)}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className={clsx('grid gap-2', isLarge ? 'grid-cols-4' : 'grid-cols-2')}>
        <Stat label="Buy" value={fmt(entry.buy, 2)} color="var(--accent)" />
        <Stat label="Sell" value={fmt(entry.sell, 2)} color="var(--sell)" />
        <Stat label="Trades" value={String(entry.buy_count + entry.sell_count)} />
        <Stat
          label="Win Rate"
          value={entry.winrate !== undefined ? `${entry.winrate.toFixed(1)}%` : '—'}
        />
      </div>

      {/* Hover arrow */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-60 transition-opacity">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </button>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-lg px-2.5 py-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
      <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--muted)] mb-0.5">{label}</p>
      <p className="font-mono text-xs font-500" style={color ? { color } : { color: 'var(--text)' }}>
        {value}
      </p>
    </div>
  )
}
