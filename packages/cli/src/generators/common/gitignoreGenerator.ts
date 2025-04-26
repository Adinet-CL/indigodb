// packages/cli/src/generators/common/GitignoreGenerator.ts

import path from 'path';
import { BaseGenerator } from '../baseGenerator';
import { writeFileSafely } from '../utils/fileSystemHelper';

/**
 * Generates a standard .gitignore file for Node.js projects.
 */
export class GitignoreGenerator extends BaseGenerator {
  async generate(): Promise<void> {
    const filePath = path.join(this.projectDir, '.gitignore');
    const content = `
# Node modules
node_modules

# Build output
dist

# Environment variables
.env

# Logs
logs
*.log

# IDEs
.vscode
.idea
`.trim();

    await writeFileSafely(filePath, content);
  }
}
