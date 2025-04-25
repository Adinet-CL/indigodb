import type { ParsedSchema } from './interfaces'

export function parseGenerator(lines: string[]): ParsedSchema['generator'] {
  const result = { provider: '' }

  for (const line of lines) {
    const [key, val] = line.split('=').map(p => p.trim().replace(/^"|"$/g, ''))
    if (key === 'provider') result.provider = val
  }

  return result
}
