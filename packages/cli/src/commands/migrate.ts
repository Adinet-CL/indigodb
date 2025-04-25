import { Command } from 'commander'
import fs from 'fs'
import path from 'path'
import {
  parseIndigoSchema,
  createClientFromSchema,
  getMigrationAdapter,
  updateSchemaBase,
} from "@adinet/indigodb-runtime";

export const migrateCommand = new Command('migrate')
  .description('Create database tables or collections from indigodb.schema')
  .action(async () => {
    const schemaPath = path.resolve(process.cwd(), 'src/db/indigodb.schema')
    if (!fs.existsSync(schemaPath)) {
      console.error('❌ Cannot find src/db/indigodb.schema')
      process.exit(1)
    }

    const schemaContent = fs.readFileSync(schemaPath, 'utf-8')
    const parsed = parseIndigoSchema(schemaContent)
    const provider = parsed.datasource.provider

    const client = await createClientFromSchema(schemaPath)
    const migrator = getMigrationAdapter(provider, client)

    await migrator.migrate(parsed.models)
    console.log('✅ Migration completed.')

    updateSchemaBase();

  })
