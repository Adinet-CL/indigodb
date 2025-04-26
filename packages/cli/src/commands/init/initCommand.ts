import inquirer from "inquirer";
import path from "path";
import { InitOptions } from "./initOptions";
import { Answers, InitMode } from "../../types/answers";
import { InitOrchestrator } from "./initOrchestrator";
import { createDirectorySafely } from "../../generators/utils/fileSystemHelper";
import { installDependencies } from '../../installers/packageInstaller';


/**
 * Executes the full "init" flow.
 * Supports interactive and default (non-interactive) modes.
 */
export async function runInit(
  useDefaults = false,
  forcedMode?: InitMode
): Promise<void> {
  console.log("🛠️ IndigoDB Project Initialization");

  // Step 1: Determine init mode
  const mode: InitMode =
    forcedMode ??
    (useDefaults
      ? "full-project"
      : (
          await inquirer.prompt<{ mode: InitMode }>([
            {
              type: "list",
              name: "mode",
              message: "What would you like to initialize?",
              choices: [
                {
                  name: "Full project (project structure + database)",
                  value: "full-project",
                },
                {
                  name: "Only IndigoDB database (schema + client)",
                  value: "only-database",
                },
              ],
            },
          ])
        ).mode);

  // Step 2: Collect answers
  let answers: Answers;

  if (mode === "full-project") {
    if (useDefaults) {
      answers = {
        mode,
        projectName: "indigodb-app",
        packageManager: "pnpm",
        architecture: "Clean",
        database: "PostgreSQL",
        realtime: true,
        backendFramework: "Express",
      };
    } else {
      const fullAnswers = await inquirer.prompt<Answers>([
        {
          type: "input",
          name: "projectName",
          message: "Project name:",
          validate: (input) =>
            input.trim() !== "" || "Project name cannot be empty",
        },
        {
          type: "list",
          name: "packageManager",
          message: "Select a package manager:",
          choices: ["pnpm", "npm", "yarn"],
          default: "pnpm",
        },
        {
          type: "list",
          name: "architecture",
          message: "Select project architecture:",
          choices: ["Simple", "Clean"],
          default: "Clean",
        },
        {
          type: "list",
          name: "database",
          message: "Choose a database engine:",
          choices: ["PostgreSQL", "MongoDB"],
          default: "PostgreSQL",
        },
        {
          type: "confirm",
          name: "realtime",
          message: "Enable real-time support (WebSockets)?",
          default: true,
        },
        {
          type: "list",
          name: "backendFramework",
          message: "Select a backend framework:",
          choices: ["Express", "Fastify", "Nest"],
          default: "Express",
        },
      ]);
      answers = fullAnswers;
    }
  } else {
    if (useDefaults) {
      answers = {
        mode,
        database: "PostgreSQL",
        realtime: true,
      };
    } else {
      const dbAnswers = await inquirer.prompt<Answers>([
        {
          type: "list",
          name: "database",
          message: "Choose a database engine:",
          choices: ["PostgreSQL", "MongoDB"],
          default: "PostgreSQL",
        },
        {
          type: "confirm",
          name: "realtime",
          message: "Enable real-time support (WebSockets)?",
          default: true,
        },
      ]);
      answers = dbAnswers;
    }
  }

  // Step 3: Convert to InitOptions
  const options: InitOptions = {
    mode: answers.mode!,
    database: answers.database!,
    realtime: answers.realtime!,
    projectName: answers.projectName,
    packageManager: answers.packageManager,
    architecture: answers.architecture,
    backendFramework: answers.backendFramework,
  };

  // Step 4: Determine working directory
  let projectDir: string;

  if (options.mode === "full-project") {
    projectDir = path.resolve(process.cwd(), options.projectName!);
    await createDirectorySafely(projectDir);
  } else {
    projectDir = process.cwd();
  }

  // Step 5: Run generators
  const orchestrator = new InitOrchestrator(projectDir, options);
  await orchestrator.run();

  // Only install if full-project
  if (options.mode === 'full-project') {
    await installDependencies(projectDir, options.packageManager!);
    console.log('\n🎉 Project initialized and dependencies installed successfully!');
    console.log(`📁 Location: ${projectDir}\n`);
  }

  console.log("\n✅ Project initialized successfully!");
}
