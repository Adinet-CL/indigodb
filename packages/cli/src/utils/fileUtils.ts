import fs from 'fs'
import path from 'path'

export function writeFileSafe(filePath: string, content: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content)
}
