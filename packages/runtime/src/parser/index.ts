import type { ParsedSchema } from './interfaces'
import { parseDatasource } from './parseDatasource'
import { parseGenerator } from './parseGenerator'
import { parseModel } from './parseModel'

export function parseIndigoSchema(content: string): ParsedSchema {
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean)
  const result: ParsedSchema = {
    datasource: { provider: '', url: '' },
    generator: { provider: '' },
    models: []
  }

  let block: 'datasource' | 'generator' | 'model' | null = null
  let modelName = ''
  let blockLines: string[] = []

  for (const line of lines) {
    if (line.startsWith('//')) continue

    if (line.startsWith('datasource')) {
      if (block === 'model') result.models.push(parseModel(modelName, blockLines))
      block = 'datasource'
      blockLines = []
      continue
    }

    if (line.startsWith('generator')) {
      if (block === 'model') result.models.push(parseModel(modelName, blockLines))
      block = 'generator'
      blockLines = []
      continue
    }

    if (line.startsWith('model ')) {
      if (block === 'model') result.models.push(parseModel(modelName, blockLines))
      block = 'model'
      modelName = line.split(' ')[1]
      blockLines = []
      continue
    }

    if (line === '}') {
      if (block === 'datasource') result.datasource = parseDatasource(blockLines)
      if (block === 'generator') result.generator = parseGenerator(blockLines)
      if (block === 'model') result.models.push(parseModel(modelName, blockLines))
      block = null
      blockLines = []
      continue
    }

    if (block) blockLines.push(line)
  }

  return result
}

export * from "./interfaces";