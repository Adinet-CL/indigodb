import type { SchemaModel } from './interfaces'

export function parseModel(name: string, lines: string[]): SchemaModel {
  const fields = lines.map(line => {
    const [name, type, ...annotations] = line.split(/\s+/)
    return { name, type, annotations }
  })

  return { name, fields }
}
