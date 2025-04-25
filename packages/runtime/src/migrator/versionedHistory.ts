import fs from 'fs'
import path from 'path'
import { MigrationEntry } from './types'

const MIGRATIONS_PATH = path.resolve(process.cwd(), 'src/db/migrations')

export function generateMigrationId(name = 'auto'): string {
  const now = new Date()
  const timestamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 14)
  return `${timestamp}_${name}`
}

export async function saveMigrationStep(entry: MigrationEntry) {
  const dir = path.resolve('src/db/migrations', entry.id)
  fs.mkdirSync(dir, { recursive: true })

  const file = path.join(dir, 'migration.json')
  fs.writeFileSync(file, JSON.stringify(entry, null, 2))
}

export function loadAllMigrationSteps(): MigrationEntry[] {
  if (!fs.existsSync(MIGRATIONS_PATH)) return []

  const folders = fs.readdirSync(MIGRATIONS_PATH).filter(f => {
    const folderPath = path.join(MIGRATIONS_PATH, f)
    return fs.statSync(folderPath).isDirectory() && fs.existsSync(path.join(folderPath, 'migration.json'))
  })

  const entries: MigrationEntry[] = folders.map(folder => {
    const filePath = path.join(MIGRATIONS_PATH, folder, 'migration.json')
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw)
  })

  return entries.sort((a, b) => a.appliedAt.localeCompare(b.appliedAt))
}

export function getLastMigration(): MigrationEntry | undefined {
  const all = loadAllMigrationSteps()
  return all.length ? all[all.length - 1] : undefined
}
