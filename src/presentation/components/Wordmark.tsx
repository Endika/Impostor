/** The Impostor mark: a domino mask, the same drawing as the app icon. */
export function MaskMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={(size * 30) / 52} viewBox="6 17 52 30" aria-hidden focusable="false">
      <path
        d="M8 30c0-6 5-10 13-10 6 0 8 3 11 3s5-3 11-3c8 0 13 4 13 10 0 9-6 15-14 15-5 0-7-4-10-4s-5 4-10 4c-8 0-14-6-14-15z"
        fill="var(--color-brand)"
      />
      <ellipse cx="21" cy="31" rx="5" ry="4" fill="var(--color-ground)" />
      <ellipse cx="43" cy="31" rx="5" ry="4" fill="var(--color-ground)" />
    </svg>
  )
}
