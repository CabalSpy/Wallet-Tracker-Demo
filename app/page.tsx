import { fetchLeaderboard } from '@/lib/api'
import { LeaderboardClient } from '@/components/LeaderboardClient'

export default async function Home() {
  // Pre-fetch default (SOL KOL 1d) for instant first paint
  const initial = await fetchLeaderboard('SOL', 'KOL', '1d').catch(() => [])
  return <LeaderboardClient initialData={initial} />
}
