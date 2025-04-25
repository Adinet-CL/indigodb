import { Command } from 'commander'
import { 
    createClientFromSchema, 
    getLastMigration,
    loadAllMigrationSteps,
    getRollbackAdapter,
} from '@adinet/indigodb-runtime'
import fs from 'fs'
import path from 'path'

export const rollbackCommand = new Command('rollback')
  .description('Rollback one or more applied migrations')

rollbackCommand
  .command('last')
  .description('Rollback the last applied migration')
  .action(async () => {
    const last = getLastMigration()
    if (!last) return console.log('ℹ️ No migration to rollback.')

    const client = await createClientFromSchema('src/db/indigodb.schema')
    const rollbacker = getRollbackAdapter(last.provider, client)

    await rollbacker.rollback(last)
    fs.rmSync(path.resolve('src/db/migrations', last.id), { recursive: true })
    console.log(`✅ Rolled back migration: ${last.id}`)
  })

rollbackCommand
  .command('to')
  .description('Rollback to a specific migration ID (inclusive)')
  .argument('<id>', 'Migration ID to rollback to')
  .action(async (targetId: string) => {
    const all = loadAllMigrationSteps()
    const index = all.findIndex(m => m.id === targetId)

    if (index === -1) {
      console.error(`❌ Migration ID not found: ${targetId}`)
      process.exit(1)
    }

    const toRollback = all.slice(index).reverse()
    const client = await createClientFromSchema('src/db/indigodb.schema')

    for (const migration of toRollback) {
      const rollbacker = getRollbackAdapter(migration.provider, client)
      await rollbacker.rollback(migration)

      fs.rmSync(path.resolve('src/db/migrations', migration.id), { recursive: true })
      console.log(`✅ Rolled back: ${migration.id}`)
    }

    console.log(`🔁 Completed rollback to: ${targetId}`)
  })

  rollbackCommand
  .command('all')
  .description('Rollback all applied migrations')
  .action(async () => {
    const all = loadAllMigrationSteps()
    if (!all.length) {
      console.log('ℹ️ No migrations to rollback.')
      return
    }

    const client = await createClientFromSchema('src/db/indigodb.schema')

    for (const migration of [...all].reverse()) {
      const rollbacker = getRollbackAdapter(migration.provider, client)
      await rollbacker.rollback(migration)

      const folder = path.resolve('src/db/migrations', migration.id)
      fs.rmSync(folder, { recursive: true, force: true })

      console.log(`✅ Rolled back: ${migration.id}`)
    }

    console.log('🚨 All migrations rolled back and migration folders deleted.')
  })
