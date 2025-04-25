import { Command } from 'commander'
import fs from 'fs'
import path from 'path'
import { parseIndigoSchema } from '@adinet/indigodb-runtime'

export async function runGenerate() {
  const schemaPath = path.resolve(process.cwd(), 'src/db/indigodb.schema')
  const outputDir = path.resolve(process.cwd(), 'src/db/generated/types')

  if (!fs.existsSync(schemaPath)) {
    console.error('❌ indigodb.schema not found at src/db')
    process.exit(1)
  }

  const schemaContent = fs.readFileSync(schemaPath, 'utf-8')
  const parsed = parseIndigoSchema(schemaContent)
  const adapter = parsed.datasource.provider ?? 'postgresql'

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  for (const model of parsed.models) {
    const modelFile = path.join(outputDir, `${model.name}.ts`)
    const fields = model.fields.map(f => `  ${f.name}: ${mapType(f.type, adapter)}`).join('\n')
    const typeDef = `export interface ${model.name} {\n${fields}\n}`
    fs.writeFileSync(modelFile, typeDef)
    console.log(`✅ ${model.name}.ts generated`)
  }

  const clientPath = path.resolve(process.cwd(), 'src/db/generated/client.ts')

  const clientImports = parsed.models
    .map(m => `import type { ${m.name} } from './types/${m.name}'`)
    .join('\n')

  const clientProperties = parsed.models
    .map(m => {
      const lower = m.name.charAt(0).toLowerCase() + m.name.slice(1)
      return `  ${lower}: {
      find: (query: object) => client.find<${m.name}>('${m.name}', query),
      findById: (id: string) => client.findById<${m.name}>('${m.name}', id),
      create: (data: Partial<${m.name}>) => client.create<${m.name}>('${m.name}', data),
      update: (id: string, data: Partial<${m.name}>) => client.update<${m.name}>('${m.name}', id, data),
      delete: (id: string) => client.delete('${m.name}', id)
    }`
    })
    .join(',\n\n')

  const clientFile = `import { createClientFromSchema } from '@adinet/indigodb-runtime'
  ${clientImports}

  const client = await createClientFromSchema('./src/db/indigodb.schema')

  export const db = {
  ${clientProperties}
  }
  `

  fs.writeFileSync(clientPath, clientFile)
  console.log(`✅ client.ts generated`)
}

export const generateCommand = new Command('generate')
  .description('Generate TypeScript types from indigodb.schema')
  .action(runGenerate)

function mapType(type: string, adapter: string): string {
  const common = {
    String: 'string',
    Int: 'number',
    Float: 'number',
    Boolean: 'boolean',
    DateTime: 'Date',
    JSON: 'any'
  }

  const mongo = {
    ObjectId: 'string',
    ...common
  }

  const postgres = {
    UUID: 'string',
    Text: 'string',
    Serial: 'number',
    BigInt: 'number',
    Timestamp: 'Date',
    ...common
  }

  const map = adapter === 'mongodb' ? mongo : postgres
  return map[type] ?? 'any'
}
