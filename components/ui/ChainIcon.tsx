import type { Chain } from '@/lib/api'

interface Props { chain: Chain; size?: number; className?: string }

export function ChainIcon({ chain, size = 18, className }: Props) {
  if (chain === 'SOL') return (
    <svg width={size} height={size} viewBox="0 0 128 128" className={className}>
      <defs>
        <linearGradient id="sol-g" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#9945FF"/>
          <stop offset="100%" stopColor="#14F195"/>
        </linearGradient>
      </defs>
      <path fill="url(#sol-g)"
        d="M21.7 86.4a4 4 0 0 1 2.8-1.2h86.6c1.8 0 2.7 2.1 1.4 3.4L94 107a4 4 0 0 1-2.8 1.2H4.6c-1.8 0-2.7-2.1-1.4-3.4l18.5-18.4zM21.7 21a4 4 0 0 1 2.8-1.2h86.6c1.8 0 2.7 2.1 1.4 3.4L94 41.6a4 4 0 0 1-2.8 1.2H4.6C2.8 42.8 1.9 40.7 3.2 39.4L21.7 21zM94 64.2a4 4 0 0 0-2.8-1.2H4.6C2.8 63 1.9 65.1 3.2 66.4L21.7 84.8a4 4 0 0 0 2.8 1.2h86.6c1.8 0 2.7-2.1 1.4-3.4L94 64.2z"/>
    </svg>
  )

  if (chain === 'BNB') return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
      <circle cx="16" cy="16" r="16" fill="#F3BA2F"/>
      <path fill="#fff"
        d="M12.116 14.404 16 10.52l3.886 3.886 2.26-2.26L16 6l-6.144 6.144 2.26 2.26zM6 16l2.26-2.26L10.52 16l-2.26 2.26L6 16zm6.116 1.596L16 21.48l3.886-3.886 2.26 2.259L16 26l-6.144-6.144-.002-.002 2.262-2.258zM21.48 16l2.26-2.26L26 16l-2.26 2.26L21.48 16zm-3.188-.002h.002V16L16 18.292 13.706 16v-.004L16 13.708l2.293 2.29z"/>
    </svg>
  )

  // BASE
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
      <circle cx="16" cy="16" r="16" fill="#0052FF"/>
      <path fill="#fff"
        d="M16.001 4.5C9.649 4.5 4.5 9.649 4.5 16.001S9.649 27.5 16.001 27.5c5.904 0 10.802-4.289 11.737-9.93H20.37a4.37 4.37 0 1 1 0-3.14h7.368C26.803 8.789 21.905 4.5 16.001 4.5z"/>
    </svg>
  )
}
