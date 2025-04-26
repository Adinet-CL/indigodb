import { execa } from 'execa';
import path from 'path';

export async function installDependencies(
  projectDir: string,
  packageManager: 'pnpm' | 'npm' | 'yarn'
): Promise<void> {
  console.log(`📦 Installing dependencies with ${packageManager}...`);

  try {
    await execa(packageManager, ['install'], {
      cwd: projectDir,
      stdio: 'inherit',
    });
    console.log('✅ Dependencies installed successfully!');
  } catch (error) {
    console.error('❌ Failed to install dependencies.');
    if (error instanceof Error) console.error(error.message);
  }
}
