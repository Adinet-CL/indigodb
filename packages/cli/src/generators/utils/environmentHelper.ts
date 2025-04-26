// packages/cli/src/generators/utils/EnvironmentHelper.ts

import fs from 'fs/promises';
import path from 'path';
import { existsPath } from './fileSystemHelper';

export async function ensureDatabaseUrlInEnv(projectDir: string): Promise<void> {
  const envPath = path.join(projectDir, '.env');

  if (!(await existsPath(envPath))) {
    // If .env does not exist, create it
    await fs.writeFile(envPath, 'DATABASE_URL=""\n', 'utf8');
    return;
  }

  // If .env exists, check content
  const content = await fs.readFile(envPath, 'utf8');
  if (!content.includes('DATABASE_URL=')) {
    const updated = content.trim() + '\nDATABASE_URL=""\n';
    await fs.writeFile(envPath, updated, 'utf8');
  }
}
