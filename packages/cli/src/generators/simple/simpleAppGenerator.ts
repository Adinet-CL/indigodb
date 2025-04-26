import path from 'path';
import { BaseGenerator } from '../baseGenerator';
import { writeFileSafely } from '../utils/fileSystemHelper';

/**
 * Generates a basic src/index.ts for Simple Architecture projects.
 */
export class SimpleAppGenerator extends BaseGenerator {
  async generate(): Promise<void> {
    const srcPath = path.join(this.projectDir, 'src');
    const filePath = path.join(srcPath, 'index.ts');

    const frameworkImport = this.options.backendFramework?.toLowerCase() ?? 'express';

    const code = `
import ${frameworkImport} from '${frameworkImport}';

const app = ${frameworkImport}();
const PORT = process.env.PORT || 3000;

app.get('/', (_req, res) => {
  res.send('Hello from IndigoDB Simple Project!');
});

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});
`.trim();

    await writeFileSafely(filePath, code);
  }
}
