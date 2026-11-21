import { arrayMove } from '@dnd-kit/sortable'

export interface PlayerRow {
  id: string
  name: string
}

let nextId = 0

export function createRow(name = ''): PlayerRow {
  return { id: `player-${nextId++}`, name }
}

export function rowsFromNames(names: string[]): PlayerRow[] {
  return names.map(createRow)
}

export function moveRow(rows: PlayerRow[], activeId: string, overId: string): PlayerRow[] {
  const from = rows.findIndex((r) => r.id === activeId)
  const to = rows.findIndex((r) => r.id === overId)
  if (from < 0 || to < 0 || from === to) return rows
  return arrayMove(rows, from, to)
}
