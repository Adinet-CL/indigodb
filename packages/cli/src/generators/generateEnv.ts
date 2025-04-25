import { writeFileSafe } from '../utils/fileUtils'
import path from 'path'

export function generateEnv(projectRoot: string, envUrl: string) {
  const content = `DATABASE_URL="${envUrl}"\n`
  const target = path.join(projectRoot, '.env')
  writeFileSafe(target, content)
}
