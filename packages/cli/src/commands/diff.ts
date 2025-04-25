import { Command } from 'commander'
import fs from 'fs'
import path from 'path'
import { 
    parseIndigoSchema, 
    SchemaComparator, 
    printDiff, 
    generateMigrationId, 
    saveMigrationStep,
    buildMigrationActionsFromDiffs,
} from '@adinet/indigodb-runtime'

export const diffCommand = new Command('diff')
  .description('Compare current schema with last applied schema')
  .option('--save', 'Save the detected differences as a migration step')
  .option('--name <name>', 'Name for the migration (used in folder ID)')
  .action(async (opts) => {
    const currentSchemaPath = path.resolve('src/db/indigodb.schema')
    const baseSchemaPath = path.resolve('src/db/schema.base')

    if (!fs.existsSync(currentSchemaPath)) {
      console.error('❌ Cannot find current schema: src/db/indigodb.schema')
      process.exit(1)
    }

    if (!fs.existsSync(baseSchemaPath)) {
      console.warn('⚠️  No base schema found. Assuming full creation.')
      fs.copyFileSync(currentSchemaPath, baseSchemaPath)
      console.log('✅ Base schema initialized. No diff to show.')
      return
    }

    const currentContent = fs.readFileSync(currentSchemaPath, 'utf-8')
    const baseContent = fs.readFileSync(baseSchemaPath, 'utf-8')

    const currentParsed = parseIndigoSchema(currentContent)
    const baseParsed = parseIndigoSchema(baseContent)

    const comparator = new SchemaComparator(baseParsed.models, currentParsed.models)
    const diffs = comparator.compare()

    printDiff(diffs)

    if (opts.save && diffs.length > 0) {
      const id = generateMigrationId(opts.name ?? 'diff')
      const classActions = buildMigrationActionsFromDiffs(diffs)
      const jsonActions = classActions.map(a => a.toJSON())
    
      await saveMigrationStep({
        id,
        provider: currentParsed.datasource.provider,
        appliedAt: new Date().toISOString(),
        models: Array.from(new Set(diffs.map(d => d.model))),
        actions: jsonActions
      })
    
      console.log(`📦 Migration saved: src/db/migrations/${id}/migration.json`)
    }
  })
