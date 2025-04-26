import path from 'path';
import { BaseGenerator } from '../baseGenerator';
import { writeFileSafely } from '../utils/fileSystemHelper';

/**
 * Generates a basic tsconfig.json for a TypeScript project.
 */
export class TsconfigGenerator extends BaseGenerator {
  async generate(): Promise<void> {
    const filePath = path.join(this.projectDir, 'tsconfig.json');
    const content = JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2020',
          module: 'CommonJS',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          outDir: 'dist',
          rootDir: 'src',
        },
        include: ['src'],
      },
      null,
      2
    );

    await writeFileSafely(filePath, content);
  }
}
