/** A game starts with at most as many impostors as crew: half the players, rounded down. */
export function maxImpostorsFor(playerCount: number): number {
  return Math.max(1, Math.floor(playerCount / 2))
}

/**
 * Random mode can go further when impostors don't know each other, as long as two crew
 * remain: with a single crew member the crew could never win.
 */
export function maxRandomImpostorsFor(playerCount: number, impostorsSeeEachOther: boolean): number {
  return impostorsSeeEachOther ? maxImpostorsFor(playerCount) : Math.max(1, playerCount - 2)
}
