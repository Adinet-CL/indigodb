import type { ParsedSchema } from './interfaces'

export function parseDatasource(lines: string[]): ParsedSchema['datasource'] {
  const result: ParsedSchema['datasource'] = {
    provider: '',
    url: '',
    dbName: undefined
  }
  

  for (const line of lines) {
    const [key, val] = line.split('=').map(p => p.trim().replace(/^"|"$/g, ''))
    if (key === 'provider') result.provider = val
    if (key === 'url') result.url = val
    if (key === 'dbName') result.dbName = val
  }

  return result
}
