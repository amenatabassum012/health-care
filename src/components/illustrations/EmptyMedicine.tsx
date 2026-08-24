export function EmptyMedicine({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" className={className}>
      <circle cx="100" cy="80" r="70" fill="currentColor" fillOpacity="0.08" />
      <rect x="88" y="40" width="24" height="18" rx="4" fill="currentColor" fillOpacity="0.9" />
      <rect
        x="78"
        y="55"
        width="44"
        height="70"
        rx="10"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <line x1="78" y1="80" x2="122" y2="80" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.5" />
      <circle cx="132" cy="100" r="16" fill="none" stroke="currentColor" strokeWidth="3.5" />
      <line x1="143" y1="111" x2="156" y2="124" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}
