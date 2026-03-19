export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.05]"
            style={{ background: 'rgba(8,10,13,0.94)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

        {/* Logo */}
        <a href="https://cabalspy.xyz" target="_blank" rel="noreferrer"
           className="flex items-center gap-2.5 group flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://cabalspy.xyz/images/logo.png"
            alt="CabalSpy"
            width={28} height={28}
            style={{ borderRadius: 6 }}
            onError={e => {
              // Fallback to vector logo if logo.png doesn't exist
              (e.currentTarget as HTMLImageElement).src = 'https://cabalspy.xyz/images/logovector.png'
            }}
          />
          <span className="font-display font-800 text-sm tracking-[0.18em] text-white uppercase">
            CabalSpy
          </span>
        </a>

        {/* Live dot */}
        <div className="flex items-center gap-2 font-mono text-[10px] text-[var(--muted2)] uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-blink flex-shrink-0" />
          Live
        </div>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-5 font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
          {[
            ['Dashboard', 'https://dashboard.cabalspy.xyz'],
            ['Docs',      'https://cabalspy.gitbook.io/cabalspy-docs'],
            ['API',       'https://apidashboard.cabalspy.xyz'],
          ].map(([label, href]) => (
            <a key={label} href={href} target="_blank" rel="noreferrer"
               className="hover:text-[var(--text)] transition-colors">
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
