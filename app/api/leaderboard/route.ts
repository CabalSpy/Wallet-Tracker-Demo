import { NextRequest, NextResponse } from 'next/server'
import { fetchLeaderboard } from '@/lib/api'
import type { Chain, Category, Period } from '@/lib/api'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const p  = new URL(req.url).searchParams
  const chain    = (p.get('chain')    ?? 'SOL')  as Chain
  const category = (p.get('category') ?? 'KOL')  as Category
  const period   = (p.get('period')   ?? '1d')   as Period
  try {
    const data = await fetchLeaderboard(chain, category, period)
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
