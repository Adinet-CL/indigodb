import { Command } from 'commander'
import fs from 'fs'
import path from 'path'
import { parseIndigoSchema, createClientFromSchema } from '@adinet/indigodb-runtime'
import { runGenerate } from './generate'
import { generateModelStructure } from "../generators/generateStructure";
import prompts from 'prompts'

export const devCommand = new Command('dev')
  .description('Run development mode: generate + connect + (optional) realtime + suggest structure')
  .action(async () => {
    const schemaPath = path.resolve(process.cwd(), 'src/db/indigodb.schema')
    if (!fs.existsSync(schemaPath)) {
      console.error('❌ Cannot find src/db/indigodb.schema')
      process.exit(1)
    }

    // 1. Generar types + cliente
    console.log('⚙️  Running indigodb generate...')
    await runGenerate()

    // 2. Leer el schema
    const rawSchema = fs.readFileSync(schemaPath, 'utf-8')
    const parsed = parseIndigoSchema(rawSchema)
    const adapter = parsed.datasource.provider

    // 3. Conectar a la base
    const client = await createClientFromSchema(schemaPath)
    console.log(`✅ Connected to ${adapter}`)

    // 4. Si realtime, mostrar puerto (ya corre internamente por `createClient`)
    if (parsed.datasource.provider === 'mongodb' || parsed.datasource.provider === 'postgresql') {
      console.log('📡 Realtime server (if enabled) should now be active')
    }

    // 5. Sugerir generar estructuras base
    const modelNames = parsed.models.map(m => m.name)
    const { generateFiles } = await prompts({
      type: 'confirm',
      name: 'generateFiles',
      message: `Detected models: ${modelNames.join(', ')}. Generate base structure (controller/service/repo)?`,
      initial: true
    })

    if (generateFiles) {
      generateModelStructure(parsed.models);
    } else {
      console.log('❌ Structure generation skipped')
    }

    console.log('🚀 IndigoDB is ready. Use the generated client in your backend!')
  })
