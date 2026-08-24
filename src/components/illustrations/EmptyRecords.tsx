export function EmptyRecords({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" className={className}>
      <circle cx="100" cy="80" r="70" fill="currentColor" fillOpacity="0.08" />
      <rect x="76" y="30" width="48" height="16" rx="6" fill="currentColor" fillOpacity="0.9" />
      <rect
        x="60"
        y="40"
        width="80"
        height="96"
        rx="10"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <polyline
        points="72,90 88,90 94,76 102,104 110,90 128,90"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="72" y1="112" x2="128" y2="112" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.5" />
      <line x1="72" y1="122" x2="112" y2="122" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.5" />
    </svg>
  )
}
