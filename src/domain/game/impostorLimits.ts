/** A game starts with fewer impostors than crew: at most floor((players - 1) / 2). */
export function maxImpostorsFor(playerCount: number): number {
  return Math.max(1, Math.floor((playerCount - 1) / 2))
}
