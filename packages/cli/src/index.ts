import { Command } from 'commander';
import { runInit } from './commands/init/initCommand';

const program = new Command();

program
  .name('indigodb')
  .description('IndigoDB CLI - The cleanest way to scaffold your IndigoDB projects')
  .version('1.0.0');

program
  .command('init')
  .option('-y, --yes', 'Use default values and skip prompts')
  .option('--only-database', 'Force mode: only database (overrides --yes)')
  .action(async (options) => {
    const mode = options.onlyDatabase ? 'only-database' : undefined;
    await runInit(options.yes ?? false, mode);
  });




program.parse(process.argv);