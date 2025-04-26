import { promises as fs } from 'fs';
import path from 'path';

export async function writeFileSafely(filePath: string, content: string): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, content, 'utf8');
}

export async function createDirectorySafely(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function existsPath(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}