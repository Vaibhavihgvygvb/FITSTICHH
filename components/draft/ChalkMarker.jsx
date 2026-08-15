/**
 * Chalk on cloth — the second ground of this world, actually drawn.
 *
 * A cutting marker as it is chalked onto laid cloth before the blade goes in:
 * pieces nested tight to waste nothing, each with its cut line, its seam
 * allowance offset inside it, and its grain arrow. Geometry only — every
 * coordinate is exact, nothing here imitates a photograph.
 */
export default function ChalkMarker({ className }) {
  const piece = (x, y, s = 1, flip = false) => (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} key={`${x}-${y}`}>
      {/* cut line */}
      <path
        d="M0 0 L0 74 L-10 92 L26 106 L34 100 L42 106 L78 92 L68 74 L68 0 Z"
        stroke="currentColor"
        strokeWidth="2.6"
        fill="none"
      />
      {/* seam allowance, offset inside the cut line */}
      <path
        d="M6 6 L6 72 L-1 85 L27 96 L34 91 L41 96 L69 85 L62 72 L62 6 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 5"
        fill="none"
        opacity="0.75"
      />
      {/* grain */}
      <path d="M34 20 L34 62" stroke="currentColor" strokeWidth="1.9" />
      <path d="M31 24 L34 19 L37 24" stroke="currentColor" strokeWidth="1.9" fill="none" />
      <path d="M31 58 L34 63 L37 58" stroke="currentColor" strokeWidth="1.9" fill="none" />
    </g>
  );

  const sleeve = (x, y, s = 1) => (
    <g transform={`translate(${x} ${y}) scale(${s})`} key={`s-${x}-${y}`}>
      <path d="M0 0 L46 0 L38 54 Q23 62 8 54 Z" stroke="currentColor" strokeWidth="2.6" fill="none" />
      <path d="M6 6 L40 6 L33 50 Q23 56 13 50 Z" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 5" fill="none" opacity="0.75" />
    </g>
  );

  return (
    <svg
      className={className || 'pointer-events-none absolute inset-0 h-full w-full text-chalk opacity-40'}
      viewBox="0 0 1440 520"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      aria-hidden="true"
      /* chalk is a broad soft stick, not a technical pen */
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ filter: 'blur(0.35px)' }}
    >
      {/* the cloth's selvedge edges, which bound every marker */}
      <path d="M0 26 L1440 26 M0 494 L1440 494" stroke="currentColor" strokeWidth="1.6" strokeDasharray="16 10" opacity="0.7" />
      {piece(70, 62, 1.3)}
      {piece(268, 62, 1.3)}
      {sleeve(470, 74, 1.35)}
      {sleeve(556, 184, 1.35)}
      {piece(700, 62, 1.3)}
      {piece(898, 62, 1.3)}
      {sleeve(1100, 74, 1.35)}
      {sleeve(1186, 184, 1.35)}
      {piece(160, 252, 1.3)}
      {piece(1284, 252, 1.05)}
    </svg>
  );
}
