// packages/cli/src/types/Answers.ts

export type InitMode = 'full-project' | 'only-database';

export type Architecture = 'Simple' | 'Clean';
export type Database = 'PostgreSQL' | 'MongoDB';
export type PackageManager = 'pnpm' | 'npm' | 'yarn';
export type BackendFramework = 'Express' | 'Fastify' | 'Nest';

export interface Answers {
  mode: InitMode;
  database: Database;
  realtime: boolean;
  projectName?: string;
  packageManager?: PackageManager;
  architecture?: Architecture;
  backendFramework?: BackendFramework;
}
