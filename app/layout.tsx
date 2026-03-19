import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CabalSpy — Wallet Intelligence',
  description: 'Real-time KOL & Smart Money leaderboard across Solana, BNB & Base.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>{children}</body>
    </html>
  )
}
