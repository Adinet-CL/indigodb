import { writeFileSafe } from '../utils/fileUtils'
import path from 'path'
import { getMainContent } from './main'

export function generateMain(projectRoot: string, framework: string) {
  const content = getMainContent(framework)
  const file = path.join(projectRoot, 'src/main.ts')
  writeFileSafe(file, content)
}

