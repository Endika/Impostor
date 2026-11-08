/**
 * Impostors who know each other vote together, so they must not outnumber the crew.
 * Otherwise two crew must remain because a 1-vs-1 ends as an impostor win.
 */
export function maxImpostorsFor(playerCount: number, impostorsSeeEachOther: boolean): number {
  return impostorsSeeEachOther
    ? Math.max(1, Math.floor(playerCount / 2))
    : Math.max(1, playerCount - 2)
}
