import path from 'path';
import { BaseGenerator } from '../baseGenerator';
import { createDirectorySafely, writeFileSafely } from '../utils/fileSystemHelper';

/**
 * Generates the "infrastructure" layer for Clean Architecture projects.
 */
export class CleanInfrastructureGenerator extends BaseGenerator {
  async generate(): Promise<void> {
    const infrastructurePath = path.join(this.projectDir, 'src', 'infrastructure');
    const repositoriesPath = path.join(infrastructurePath, 'repositories');
    const serverPath = path.join(infrastructurePath, 'server');

    // Ensure directories exist
    await createDirectorySafely(repositoriesPath);
    await createDirectorySafely(serverPath);

    // Create InMemory Repository Implementation
    const repoCode = `
import { IGreetingRepository } from '../../domain/repositories/IGreetingRepository';
import { Greeting } from '../../domain/entities/Greeting';

export class InMemoryGreetingRepository implements IGreetingRepository {
  async getGreeting(): Promise<Greeting> {
    return new Greeting('Hello from IndigoDB Clean Architecture!');
  }
}
`.trim();
    await writeFileSafely(path.join(repositoriesPath, 'inMemoryGreetingRepository.ts'), repoCode);

    // Create server bootstrap
    const serverCode = `
import express from 'express';
import { InMemoryGreetingRepository } from '../repositories/inMemoryGreetingRepository';
import { GreetingService } from '../../application/services/greetingService';
import { createGreetingRouter } from '../../interfaces/http/greetingController';

async function bootstrap() {
  const app = express();

  const repository = new InMemoryGreetingRepository();
  const service = new GreetingService(repository);

  app.use('/greet', createGreetingRouter(service));

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(\`Server running at http://localhost:\${port}/greet\`);
  });
}

bootstrap();
`.trim();
    await writeFileSafely(path.join(serverPath, 'server.ts'), serverCode);
  }
}
