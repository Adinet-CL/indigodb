import { writeFileSafe } from '../utils/fileUtils'
import path from 'path'

export function generateConfig(projectRoot: string, data: any) {
  const config = {
    projectName: data.name,
    language: 'ts',
    framework: data.framework,
    architecture: 'clean',
    database: {
      provider: data.provider,
      useEnv: data.useEnv,
      realtime: data.realtime,
      realtimePort: data.realtimePort,
      realtimeOrigins: ['*']
    },
    schemaPath: './src/db/indigodb.schema',
    clientOutput: './src/db/generated',
    generateStructure: true
  }

  writeFileSafe(path.join(projectRoot, 'indigodb.json'), JSON.stringify(config, null, 2))
}
