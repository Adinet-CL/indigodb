import path from 'path'
import fs from 'fs'
import {
  generateEnv,
  generateSchema,
  generateConfig,
  generateMain,
  installDependencies
} from '../generators'


export async function generateProject(data: {
  name: string
  framework: 'express' | 'fastify'
  provider: 'postgresql' | 'mongodb'
  useEnv: boolean
  envUrl: string
  realtime: boolean
  realtimePort: number
}) {
  const projectRoot = path.resolve(process.cwd(), data.name)
  const dbPath = path.join(projectRoot, 'src/db/generated')
  fs.mkdirSync(dbPath, { recursive: true })

  if (data.useEnv) {
    generateEnv(projectRoot, data.envUrl)
  }

  generateSchema(projectRoot, data.provider, data.useEnv, data.envUrl)
  generateConfig(projectRoot, data)
  generateMain(projectRoot, data.framework)
  installDependencies(projectRoot, data.framework)
}
