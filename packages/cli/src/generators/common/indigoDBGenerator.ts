import path from 'path';
import { BaseGenerator } from '../baseGenerator';
import { writeFileSafely } from '../utils/fileSystemHelper';
import { ensureDatabaseUrlInEnv } from '../utils/environmentHelper';

export class IndigoDBSchemaGenerator extends BaseGenerator {
  async generate(): Promise<void> {
    const filePath = path.join(this.projectDir, 'indigodb.schema');

    const datasourceBlock = `
datasource db {
  provider = "${this.options.database === 'PostgreSQL' ? 'postgresql' : 'mongodb'}"
  url      = env("DATABASE_URL")
}
`.trim();

    const generatorBlock = `
generator client {
  provider = "indigoclient"
}
`.trim();

    const realtimeBlock = this.options.realtime
      ? `
generator realtime {
  provider = "indigoclient-realtime"
}
`.trim()
      : '';

    const content = [datasourceBlock, generatorBlock, realtimeBlock]
      .filter(Boolean)
      .join('\n\n');

    await writeFileSafely(filePath, content);

    // Always ensure DATABASE_URL exists in .env
    await ensureDatabaseUrlInEnv(this.projectDir);
  }
}
