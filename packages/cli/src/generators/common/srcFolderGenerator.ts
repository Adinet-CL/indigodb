import path from 'path';
import { BaseGenerator } from '../baseGenerator';
import { createDirectorySafely } from '../utils/fileSystemHelper';

/**
 * Generates the "src" folder if it does not exist.
 */
export class SrcFolderGenerator extends BaseGenerator {
  async generate(): Promise<void> {
    const srcPath = path.join(this.projectDir, 'src');
    await createDirectorySafely(srcPath);
  }
}
