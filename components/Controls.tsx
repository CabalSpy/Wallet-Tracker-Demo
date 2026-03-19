'use client'

import type { Chain, Category, Period } from '@/lib/api'
import { ChainIcon } from './ui/ChainIcon'
import clsx from 'clsx'

interface Props {
  chain:      Chain;    onChain:    (c: Chain)    => void
  category:  Category; onCategory: (c: Category) => void
  period:    Period;   onPeriod:   (p: Period)   => void
  loading:   boolean
}

const CHAINS: { value: Chain; label: string }[] = [
  { value: 'SOL',  label: 'Solana' },
  { value: 'BNB',  label: 'BNB'    },
  { value: 'BASE', label: 'Base'   },
]

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'KOL',   label: 'KOL'         },
  { value: 'Smart', label: 'Smart Money'  },
]

const PERIODS: Period[] = ['6h', '1d', '7d', '30d']

const pill = 'p-1 rounded-xl flex items-center gap-0.5'
const pillStyle = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }

export function Controls({ chain, onChain, category, onCategory, period, onPeriod, loading }: Props) {
  return (
    <div className="mt-6 mb-8 flex flex-wrap items-center justify-between gap-3 animate-fade-in">

      {/* Left: Chain selector */}
      <div className={pill} style={pillStyle}>
        {CHAINS.map(c => (
          <button
            key={c.value}
            onClick={() => onChain(c.value)}
            disabled={loading}
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all',
              chain === c.value ? 'text-white' : 'text-[var(--muted2)] hover:text-[var(--text)]'
            )}
            style={chain === c.value ? { background: 'rgba(255,255,255,0.08)' } : {}}
          >
            <ChainIcon chain={c.value} size={14} />
            <span className="hidden sm:inline">{c.label}</span>
          </button>
        ))}
      </div>

      {/* Center: Category selector */}
      <div className={pill} style={pillStyle}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => onCategory(cat.value)}
            disabled={loading}
            className={clsx(
              'px-4 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all',
              category === cat.value
                ? 'text-[var(--accent)]'
                : 'text-[var(--muted2)] hover:text-[var(--text)]'
            )}
            style={category === cat.value
              ? { background: 'rgba(0,214,143,0.09)', border: '1px solid rgba(0,214,143,0.18)' }
              : {}}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Right: Period + spinner */}
      <div className="flex items-center gap-2">
        <div className={pill} style={pillStyle}>
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => onPeriod(p)}
              disabled={loading}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all',
                period === p ? 'text-white' : 'text-[var(--muted)] hover:text-[var(--text)]'
              )}
              style={period === p ? { background: 'rgba(255,255,255,0.08)' } : {}}
            >
              {p}
            </button>
          ))}
        </div>

        {loading && (
          <div className="w-4 h-4 rounded-full border-2 border-[var(--accent)]/25
                          border-t-[var(--accent)] animate-spin flex-shrink-0" />
        )}
      </div>
    </div>
  )
}
