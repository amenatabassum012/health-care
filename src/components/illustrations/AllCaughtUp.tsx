export function AllCaughtUp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" className={className}>
      <circle cx="100" cy="80" r="70" fill="currentColor" fillOpacity="0.08" />
      <rect x="84" y="32" width="32" height="14" rx="5" fill="currentColor" fillOpacity="0.9" />
      <rect
        x="64"
        y="40"
        width="72"
        height="90"
        rx="10"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <line x1="78" y1="70" x2="122" y2="70" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.5" />
      <line x1="78" y1="82" x2="110" y2="82" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.5" />
      <circle cx="100" cy="108" r="20" fill="currentColor" fillOpacity="0.9" />
      <polyline
        points="91,108 98,115 111,100"
        fill="none"
        stroke="var(--card)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
