// packages/cli/src/generators/common/PackageJsonGenerator.ts

import path from 'path';
import { BaseGenerator } from '../baseGenerator';
import { writeFileSafely } from '../utils/fileSystemHelper';

/**
 * Generates the package.json file based on InitOptions.
 */
export class PackageJsonGenerator extends BaseGenerator {
  async generate(): Promise<void> {
    const filePath = path.join(this.projectDir, 'package.json');

    const basePackageJson: any = {
      name: this.options.projectName ?? 'indigodb-project',
      version: '0.1.0',
      private: true,
      scripts: {
        dev: this.options.mode === 'full-project'
          ? (this.options.backendFramework === 'Nest' ? 'nest start --watch' : 'ts-node src/index.ts')
          : undefined,
        build: this.options.mode === 'full-project' ? 'tsc' : undefined,
        start: this.options.mode === 'full-project'
          ? (this.options.backendFramework === 'Nest' ? 'nest start' : 'node dist/index.js')
          : undefined,
      },
      dependencies: {},
      devDependencies: {
        typescript: '^5.0.0',
        'ts-node': '^10.0.0',
      },
    };

    // Database driver
    if (this.options.database === 'PostgreSQL') {
      basePackageJson.dependencies['pg'] = '^8.0.0';
    } else if (this.options.database === 'MongoDB') {
      basePackageJson.dependencies['mongodb'] = '^5.0.0';
    }

    // Realtime support (WebSocket)
    if (this.options.realtime) {
      basePackageJson.dependencies['ws'] = '^8.0.0';
    }

    // Backend framework (only if full-project)
    if (this.options.mode === 'full-project') {
      switch (this.options.backendFramework) {
        case 'Express':
          basePackageJson.dependencies['express'] = '^4.18.0';
          break;
        case 'Fastify':
          basePackageJson.dependencies['fastify'] = '^4.0.0';
          break;
        case 'Nest':
          basePackageJson.dependencies['@nestjs/core'] = '^10.0.0';
          basePackageJson.dependencies['@nestjs/common'] = '^10.0.0';
          basePackageJson.devDependencies['@nestjs/cli'] = '^10.0.0';
          break;
      }
    }

    // Clean empty fields
    Object.keys(basePackageJson.scripts).forEach((key) => {
      if (basePackageJson.scripts[key] === undefined) {
        delete basePackageJson.scripts[key];
      }
    });

    // Save the file
    await writeFileSafely(filePath, JSON.stringify(basePackageJson, null, 2));
  }
}
