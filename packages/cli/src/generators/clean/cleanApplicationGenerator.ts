import path from 'path';
import { BaseGenerator } from '../baseGenerator';
import { createDirectorySafely, writeFileSafely } from '../utils/fileSystemHelper';

/**
 * Generates the "application" layer for Clean Architecture projects.
 */
export class CleanApplicationGenerator extends BaseGenerator {
  async generate(): Promise<void> {
    const applicationPath = path.join(this.projectDir, 'src', 'application');
    const servicesPath = path.join(applicationPath, 'services');

    // Ensure directories exist
    await createDirectorySafely(servicesPath);

    // Create a basic Service
    const serviceCode = `
import { IGreetingRepository } from '../../domain/repositories/IGreetingRepository';

export class GreetingService {
  constructor(private readonly greetingRepository: IGreetingRepository) {}

  async greet(): Promise<string> {
    const greeting = await this.greetingRepository.getGreeting();
    return greeting.message;
  }
}
`.trim();

    await writeFileSafely(path.join(servicesPath, 'greetingService.ts'), serviceCode);
  }
}
