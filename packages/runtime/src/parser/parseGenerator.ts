import type { ParsedSchema } from './interfaces'

export function parseGenerator(lines: string[]): ParsedSchema['generator'] {
  const kv = Object.fromEntries(
    lines
      .filter((line) => line.includes("="))
      .map((line) => line.split("="))
      .map(s => s.trim().replace(/"/g, ''))
  );

  return { provider: kv.provider ?? ''};
}
