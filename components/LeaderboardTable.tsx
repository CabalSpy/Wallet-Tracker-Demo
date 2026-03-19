'use client'

import type { LeaderboardEntry, Chain } from '@/lib/api'
import { chainCurrency } from '@/lib/api'
import { fmt, fmtSign, fmtPct, shorten } from '@/lib/format'
import { Avatar } from './ui/Avatar'
import { SocialLinks } from './ui/SocialLinks'
import clsx from 'clsx'

interface Props {
  entries:  LeaderboardEntry[]
  loading:  boolean
  chain:    Chain
  onSelect: (wallet: string) => void
}

export function LeaderboardTable({ entries, loading, chain, onSelect }: Props) {
  const currency = chainCurrency(chain)

  return (
    <div className="animate-fade-in">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted2)]">Traders</span>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      {/* Desktop column headers */}
      <div className="hidden md:grid items-center px-4 mb-1.5"
           style={{ gridTemplateColumns: '44px 1fr 130px 100px 120px 120px 72px' }}>
        {['Rank','Trader','PNL','Win Rate','Buy','Sell','Trades'].map(h => (
          <span key={h} className="font-mono text-[9px] uppercase tracking-widest text-[var(--muted)]
                                   text-right first:text-left [&:nth-child(2)]:text-left">
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div className="space-y-px">
        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="skeleton h-[52px] rounded-xl"
                   style={{ animationDelay: `${i * 55}ms` }} />
            ))
          : entries.length === 0
            ? (
              <div className="py-16 text-center font-mono text-sm text-[var(--muted2)]">
                No data for this filter combination
              </div>
            )
            : entries.map((entry, i) => (
                <TableRow
                  key={entry.wallet}
                  entry={entry}
                  currency={currency}
                  index={i}
                  onSelect={() => onSelect(entry.wallet)}
                />
              ))
        }
      </div>
    </div>
  )
}

function TableRow({ entry, currency, index, onSelect }: {
  entry:    LeaderboardEntry
  currency: string
  index:    number
  onSelect: () => void
}) {
  const pnlPos = entry.pnl >= 0

  return (
    <button
      onClick={onSelect}
      className="group w-full text-left rounded-xl border border-transparent
                 hover:border-white/[0.07] hover:bg-white/[0.018] transition-all duration-150
                 focus:outline-none focus:border-[var(--accent)]/25"
      style={{ animationDelay: `${index * 25}ms` }}
    >
      {/* Mobile */}
      <div className="flex md:hidden items-center gap-3 px-3 py-3">
        <span className="font-mono text-xs text-[var(--muted)] w-6 text-right flex-shrink-0">
          {entry.rank}
        </span>
        <Avatar src={entry.image_url} name={entry.name} size={34} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-500 text-white truncate">{entry.name || shorten(entry.wallet)}</p>
          <SocialLinks twitter={entry.twitter} telegram={entry.telegram} size="sm" />
        </div>
        <div className="text-right flex-shrink-0">
          <p className={clsx('font-mono text-sm font-500', pnlPos ? 'pos' : 'neg')}>
            {fmtSign(entry.pnl, 2)}
          </p>
          <p className={clsx('font-mono text-[10px]', pnlPos ? 'pos' : 'neg')}>
            {fmtPct(entry.pnl_percent)}
          </p>
        </div>
        <svg className="w-3 h-3 text-[var(--muted)] group-hover:text-[var(--text)] transition-colors flex-shrink-0"
             viewBox="0 0 24 24" fill="none">
          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Desktop */}
      <div className="hidden md:grid items-center px-4 py-3"
           style={{ gridTemplateColumns: '44px 1fr 130px 100px 120px 120px 72px' }}>

        {/* Rank */}
        <span className="font-mono text-xs text-[var(--muted)] text-right">{entry.rank}</span>

        {/* Trader */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar src={entry.image_url} name={entry.name} size={30} />
          <div className="min-w-0">
            <p className="text-sm font-500 text-white truncate leading-tight">
              {entry.name || shorten(entry.wallet)}
            </p>
            <SocialLinks twitter={entry.twitter} telegram={entry.telegram} size="sm" />
          </div>
        </div>

        {/* PNL */}
        <div className="text-right">
          <p className={clsx('font-mono text-sm font-500', pnlPos ? 'pos' : 'neg')}>
            {fmtSign(entry.pnl, 2)}
          </p>
          <p className={clsx('font-mono text-[10px]', pnlPos ? 'pos' : 'neg')}>
            {fmtPct(entry.pnl_percent)}
          </p>
        </div>

        {/* Win Rate */}
        <div className="text-right">
          <p className="font-mono text-sm text-[var(--text)]">
            {entry.winrate !== undefined ? `${entry.winrate.toFixed(1)}%` : '—'}
          </p>
        </div>

        {/* Buy */}
        <div className="text-right">
          <p className="font-mono text-sm pos">{fmt(entry.buy, 2)}</p>
          <p className="font-mono text-[10px] text-[var(--muted)]">{entry.buy_count} txns</p>
        </div>

        {/* Sell */}
        <div className="text-right">
          <p className="font-mono text-sm neg">{fmt(entry.sell, 2)}</p>
          <p className="font-mono text-[10px] text-[var(--muted)]">{entry.sell_count} txns</p>
        </div>

        {/* Trades */}
        <div className="text-right">
          <p className="font-mono text-sm text-[var(--text)]">
            {entry.buy_count + entry.sell_count}
          </p>
        </div>
      </div>
    </button>
  )
}
