'use client'

import { useState, useCallback, useTransition } from 'react'
import type { LeaderboardEntry, Chain, Category, Period } from '@/lib/api'
import { Header } from './Header'
import { Controls } from './Controls'
import { Podium } from './Podium'
import { LeaderboardTable } from './LeaderboardTable'
import { WalletPanel } from './WalletPanel'
import { Background } from './ui/Background'

interface Props { initialData: LeaderboardEntry[] }

export function LeaderboardClient({ initialData }: Props) {
  const [entries,  setEntries]  = useState<LeaderboardEntry[]>(initialData)
  const [chain,    setChain]    = useState<Chain>('SOL')
  const [category, setCategory] = useState<Category>('KOL')
  const [period,   setPeriod]   = useState<Period>('1d')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  // Wallet panel state
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const [panelOpen,      setPanelOpen]      = useState(false)
  const [panelPeriod,    setPanelPeriod]    = useState<Period>('1d')

  const [, startTransition] = useTransition()

  const fetchData = useCallback(async (c: Chain, cat: Category, p: Period) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/leaderboard?chain=${c}&category=${cat}&period=${p}`)
      if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error ?? 'Failed')
      const data = await res.json() as LeaderboardEntry[]
      startTransition(() => setEntries(data))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChain    = (c: Chain)    => { setChain(c);    fetchData(c, category, period) }
  const handleCategory = (cat: Category) => { setCategory(cat); fetchData(chain, cat, period) }
  const handlePeriod   = (p: Period)   => { setPeriod(p);   fetchData(chain, category, p)  }

  const openWallet = useCallback((wallet: string) => {
    setSelectedWallet(wallet)
    setPanelPeriod(period)   // sync period from leaderboard
    setPanelOpen(true)
  }, [period])

  const closePanel = useCallback(() => {
    setPanelOpen(false)
    setTimeout(() => setSelectedWallet(null), 350)
  }, [])

  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)

  return (
    <>
      <Background />

      {/* Wallet panel (centered modal) */}
      <WalletPanel
        wallet={selectedWallet}
        chain={chain}
        period={panelPeriod}
        open={panelOpen}
        onClose={closePanel}
        onPeriodChange={setPanelPeriod}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pb-16">

          <Controls
            chain={chain}      onChain={handleChain}
            category={category} onCategory={handleCategory}
            period={period}    onPeriod={handlePeriod}
            loading={loading}
          />

          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl font-mono text-sm text-red-400 animate-fade-in"
                 style={{ background: 'rgba(255,77,106,0.07)', border: '1px solid rgba(255,77,106,0.18)' }}>
              ⚠ {error}
            </div>
          )}

          {!error && (
            <>
              <Podium
                entries={top3}
                loading={loading}
                chain={chain}
                onSelect={openWallet}
              />
              <LeaderboardTable
                entries={rest}
                loading={loading}
                chain={chain}
                onSelect={openWallet}
              />
            </>
          )}
        </main>

        <footer className="border-t border-white/5 py-5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row
                          items-center justify-between gap-3">
            <span className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest">
              © 2025 CabalSpy · Multi-chain wallet intelligence
            </span>
            <div className="flex items-center gap-5 font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest">
              {[
                ['Docs',     'https://cabalspy.gitbook.io/cabalspy-docs'],
                ['API',      'https://cabalspy.xyz/api'],
                ['Twitter',  'https://x.com/CabalSpySol'],
                ['Discord',  'https://discord.gg/YgTPeZ2UYc'],
                ['Telegram', 'https://t.me/CabalSpyPortal'],
              ].map(([l, h]) => (
                <a key={l} href={h} target="_blank" rel="noreferrer"
                   className="hover:text-[var(--text)] transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
