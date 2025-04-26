import path from 'path';
import { BaseGenerator } from '../baseGenerator';
import { createDirectorySafely, writeFileSafely } from '../utils/fileSystemHelper';

/**
 * Generates the "interfaces" layer (HTTP Controllers) for Clean Architecture projects.
 */
export class CleanInterfacesGenerator extends BaseGenerator {
  async generate(): Promise<void> {
    const interfacesPath = path.join(this.projectDir, 'src', 'interfaces');
    const httpPath = path.join(interfacesPath, 'http');

    // Ensure directories exist
    await createDirectorySafely(httpPath);

    // Create Greeting Controller
    const controllerCode = `
import { Router } from 'express';
import { GreetingService } from '../../application/services/greetingService';

export function createGreetingRouter(greetingService: GreetingService): Router {
  const router = Router();

  router.get('/', async (_req, res) => {
    const message = await greetingService.greet();
    res.send(message);
  });

  return router;
}
`.trim();

    await writeFileSafely(path.join(httpPath, 'greetingController.ts'), controllerCode);
  }
}
