// packages/cli/src/generators/clean/CleanDomainGenerator.ts

import path from 'path';
import { BaseGenerator } from '../baseGenerator';
import { writeFileSafely, createDirectorySafely } from '../utils/fileSystemHelper';

/**
 * Generates the "domain" layer for Clean Architecture projects.
 */
export class CleanDomainGenerator extends BaseGenerator {
  async generate(): Promise<void> {
    const domainPath = path.join(this.projectDir, 'src', 'domain');
    const entitiesPath = path.join(domainPath, 'entities');
    const repositoriesPath = path.join(domainPath, 'repositories');

    // Ensure directories exist
    await createDirectorySafely(entitiesPath);
    await createDirectorySafely(repositoriesPath);

    // Create a basic Entity
    const entityCode = `
export class Greeting {
  constructor(public readonly message: string) {}
}
`.trim();
    await writeFileSafely(path.join(entitiesPath, 'Greeting.ts'), entityCode);

    // Create a basic Repository Interface
    const repositoryCode = `
import { Greeting } from '../entities/Greeting';

export interface IGreetingRepository {
  getGreeting(): Promise<Greeting>;
}
`.trim();
    await writeFileSafely(path.join(repositoriesPath, 'IGreetingRepository.ts'), repositoryCode);
  }
}
