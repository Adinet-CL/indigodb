import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execaSync } from 'execa';
import fs from 'fs';
import path from 'path';
import os from 'os';

function read(file: string) {
  return fs.readFileSync(file, 'utf8');
}

function file(projectDir: string, relativePath: string) {
  return path.join(projectDir, relativePath);
}

describe('IndigoDB CLI - init command (with --yes)', () => {
  let tempDir: string;

  beforeAll(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'indigodb-test-'));
    console.log('🧪 Project generated in:', tempDir);
  });

  afterAll(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should scaffold full clean project with default values', () => {
    const projectName = 'indigodb-app';
    const projectDir = file(tempDir, projectName);

    execaSync('node', [
      path.resolve(__dirname, '../../dist/index.js'),
      'init',
      '--yes'
    ], { cwd: tempDir });

    // Verifica carpeta
    expect(fs.existsSync(projectDir)).toBe(true);

    // Archivos base
    expect(fs.existsSync(file(projectDir, 'package.json'))).toBe(true);
    expect(fs.existsSync(file(projectDir, 'README.md'))).toBe(true);
    expect(fs.existsSync(file(projectDir, '.gitignore'))).toBe(true);
    expect(fs.existsSync(file(projectDir, 'tsconfig.json'))).toBe(true);
    expect(fs.existsSync(file(projectDir, 'indigodb.schema'))).toBe(true);
    expect(fs.existsSync(file(projectDir, '.env'))).toBe(true);

    // Estructura Clean
    expect(fs.existsSync(file(projectDir, 'src/domain/entities/greeting.ts'))).toBe(true);
    expect(fs.existsSync(file(projectDir, 'src/domain/repositories/iGreetingRepository.ts'))).toBe(true);
    expect(fs.existsSync(file(projectDir, 'src/application/services/greetingService.ts'))).toBe(true);
    expect(fs.existsSync(file(projectDir, 'src/infrastructure/repositories/inMemoryGreetingRepository.ts'))).toBe(true);
    expect(fs.existsSync(file(projectDir, 'src/infrastructure/server/server.ts'))).toBe(true);
    expect(fs.existsSync(file(projectDir, 'src/interfaces/http/greetingController.ts'))).toBe(true);

    // Contenido
    const schema = read(file(projectDir, 'indigodb.schema'));
    expect(schema).toContain('generator realtime');
    expect(schema).toContain('provider = "postgresql"');

    const env = read(file(projectDir, '.env'));
    expect(env).toContain('DATABASE_URL');
  });

  it('should scaffold only database with default values (PostgreSQL + realtime)', () => {
    const projectDir = file(tempDir, 'only-db-default');
    fs.mkdirSync(projectDir);

    execaSync('node', [
      path.resolve(__dirname, '../../dist/index.js'),
      'init',
      '--yes',
      '--only-database'
    ], { cwd: projectDir });

    // Archivos esperados
    expect(fs.existsSync(file(projectDir, 'indigodb.schema'))).toBe(true);
    expect(fs.existsSync(file(projectDir, '.env'))).toBe(true);

    const schema = read(file(projectDir, 'indigodb.schema'));
    expect(schema).toContain('generator realtime');
    expect(schema).toContain('provider = "postgresql"');

    const env = read(file(projectDir, '.env'));
    expect(env).toContain('DATABASE_URL');

    // Archivos que NO deberían existir
    expect(fs.existsSync(file(projectDir, 'package.json'))).toBe(false);
    expect(fs.existsSync(file(projectDir, 'src'))).toBe(false);
  });
});
