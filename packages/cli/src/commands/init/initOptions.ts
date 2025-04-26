// packages/cli/src/commands/init/InitOptions.ts

import type {
    InitMode,
    Architecture,
    Database,
    PackageManager,
    BackendFramework,
  } from '../../types/answers';
  
  export interface InitOptions {
    mode: InitMode;
    database: Database;
    realtime: boolean;
    // only used when mode === 'full-project'
    projectName?: string;
    packageManager?: PackageManager;
    architecture?: Architecture;
    backendFramework?: BackendFramework;
  }
  
