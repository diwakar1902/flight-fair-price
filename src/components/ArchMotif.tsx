export default function ArchMotif({ className = "h-28 w-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 150" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="archGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-teal)" />
          <stop offset="100%" stopColor="var(--color-plum)" />
        </linearGradient>
      </defs>
      <path d="M10,150 L10,60 A50,50 0 0 1 110,60 L110,150 Z" fill="url(#archGradient)" />
      <path
        d="M24,150 L24,64 A36,36 0 0 1 96,64 L96,150"
        fill="none"
        stroke="white"
        strokeOpacity="0.55"
        strokeWidth="2"
      />
      <circle cx="60" cy="10" r="4" fill="var(--color-mustard)" />
      <g fill="white" fillOpacity="0.55">
        <circle cx="38" cy="128" r="3" />
        <circle cx="60" cy="128" r="3" />
        <circle cx="82" cy="128" r="3" />
      </g>
    </svg>
  );
}
