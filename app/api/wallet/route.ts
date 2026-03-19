import { NextRequest, NextResponse } from 'next/server'
import { fetchWalletTracker } from '@/lib/api'
import type { Period } from '@/lib/api'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const p      = new URL(req.url).searchParams
  const wallet = p.get('wallet') ?? ''
  const period = (p.get('period') ?? '1d') as Period
  if (!wallet) return NextResponse.json({ error: 'wallet required' }, { status: 400 })
  try {
    const data = await fetchWalletTracker(wallet, period)
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
