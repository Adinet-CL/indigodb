import type { InitOptions } from '../commands/init/initOptions';

/**
 * Base class that all generators must extend.
 * Enforces that each generator has access to the project directory and init options,
 * and implements its own generate() method.
 */
export abstract class BaseGenerator {
  constructor(
    protected readonly projectDir: string,
    protected readonly options: InitOptions
  ) {}

  /**
   * Executes the generation process for the specific file or structure.
   */
  abstract generate(): Promise<void>;
}

