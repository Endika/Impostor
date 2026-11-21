import { describe, it, expect } from 'vitest'
import { moveRow, rowsFromNames } from '../../src/presentation/screens/playerRows'

describe('playerRows', () => {
  it('gives every row a unique id', () => {
    const ids = rowsFromNames(['', '', '']).map((r) => r.id)
    expect(new Set(ids).size).toBe(3)
  })

  it('moves a row onto the position of another, keeping ids with their names', () => {
    const rows = rowsFromNames(['Ana', 'Ben', 'Cleo'])
    const moved = moveRow(rows, rows[0]!.id, rows[2]!.id)
    expect(moved.map((r) => r.name)).toEqual(['Ben', 'Cleo', 'Ana'])
    expect(moved[2]).toBe(rows[0])
  })

  it('returns the same rows when nothing moves or an id is unknown', () => {
    const rows = rowsFromNames(['Ana', 'Ben', 'Cleo'])
    expect(moveRow(rows, rows[1]!.id, rows[1]!.id)).toBe(rows)
    expect(moveRow(rows, 'nope', rows[1]!.id)).toBe(rows)
  })
})
