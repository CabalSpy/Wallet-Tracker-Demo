'use client'
import { useState } from 'react'

interface Props { src: string; name: string; size?: number }

export function Avatar({ src, name, size = 40 }: Props) {
  const [failed, setFailed] = useState(false)

  // Build correct image URL — images live at cabalspy.xyz/images/<filename>
  const imgSrc = (() => {
    if (!src || failed) return null
    if (src.startsWith('http')) return src
    // Might be just a filename or a relative path
    const filename = src.split('/').pop()
    return `https://cabalspy.xyz/images/${filename}`
  })()

  const initials = (name || '?').slice(0, 2).toUpperCase()

  const style: React.CSSProperties = {
    width: size, height: size, borderRadius: '50%',
    flexShrink: 0, objectFit: 'cover',
    border: '1px solid rgba(255,255,255,0.09)',
  }

  if (imgSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imgSrc}
        alt={name}
        style={style}
        onError={() => setFailed(true)}
        loading="lazy"
      />
    )
  }

  return (
    <div style={{
      ...style,
      background: 'rgba(0,214,143,0.09)',
      border: '1px solid rgba(0,214,143,0.18)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: size * 0.3, color: 'var(--accent)', fontWeight: 500,
    }}>
      {initials}
    </div>
  )
}
