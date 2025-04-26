import path from 'path';
import { BaseGenerator } from '../baseGenerator';
import { writeFileSafely } from '../utils/fileSystemHelper';

/**
 * Generates indigodb.json to persist project configuration.
 */
export class ProjectConfigGenerator extends BaseGenerator {
  async generate(): Promise<void> {
    const filePath = path.join(this.projectDir, 'indigodb.json');

    const config = {
      architecture: this.options.architecture,
      database: this.options.database,
      realtime: this.options.realtime,
      backendFramework: this.options.backendFramework,
      packageManager: this.options.packageManager
    };

    await writeFileSafely(filePath, JSON.stringify(config, null, 2));
  }
}
