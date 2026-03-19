import clsx from 'clsx'

interface Props {
  twitter?:   string
  telegram?:  string
  copytrade?: string
  size?:      'sm' | 'md'
  className?: string
}

export function SocialLinks({ twitter, telegram, copytrade, size = 'md', className }: Props) {
  if (!twitter && !telegram && !copytrade) return null
  const s = size === 'sm' ? 11 : 13
  return (
    <div className={clsx('flex items-center gap-2', className)}>
      {twitter && (
        <a href={twitter.startsWith('http') ? twitter : `https://x.com/${twitter}`}
           target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
           className="text-[var(--muted)] hover:text-[var(--text)] transition-colors">
          <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>
      )}
      {telegram && (
        <a href={telegram.startsWith('http') ? telegram : `https://t.me/${telegram}`}
           target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
           className="text-[var(--muted)] hover:text-[var(--text)] transition-colors">
          <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
        </a>
      )}
      {copytrade && (
        <a href={copytrade} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
           className="font-mono text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded
                      text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
           style={{ border: '1px solid rgba(0,214,143,0.22)' }}>
          Copy
        </a>
      )}
    </div>
  )
}
