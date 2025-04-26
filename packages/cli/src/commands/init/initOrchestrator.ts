// packages/cli/src/commands/init/initOrchestrator.ts

import { InitOptions } from "./initOptions";
import { BaseGenerator } from "../../generators/baseGenerator";

// Common Generators
import { ReadmeGenerator } from "../../generators/common/readmeGenerator";
import { GitignoreGenerator } from "../../generators/common/gitignoreGenerator";
import { TsconfigGenerator } from "../../generators/common/tsconfigGenerator";
import { SrcFolderGenerator } from "../../generators/common/srcFolderGenerator";
import { PackageJsonGenerator } from "../../generators/common/packageJesonGenerator";
import { IndigoDBSchemaGenerator } from "../../generators/common/indigoDBGenerator";
import { ProjectConfigGenerator } from "../../generators/common/projectConfigGenerator";

// Simple Architecture Generator
import { SimpleAppGenerator } from "../../generators/simple/simpleAppGenerator";

// Clean Architecture Generators
import { CleanDomainGenerator } from "../../generators/clean/cleanDomainGenerator";
import { CleanApplicationGenerator } from "../../generators/clean/cleanApplicationGenerator";
import { CleanInfrastructureGenerator } from "../../generators/clean/cleanInfrastructureGenerator";
import { CleanInterfacesGenerator } from "../../generators/clean/cleanInterfacesGenerator";

/**
 * Orchestrates the execution of the appropriate generators based on InitOptions.
 */
export class InitOrchestrator {
  private readonly generators: BaseGenerator[] = [];

  constructor(
    private readonly projectDir: string,
    private readonly options: InitOptions
  ) {}

  public async run(): Promise<void> {
    this.setupGenerators();

    for (const generator of this.generators) {
      await generator.generate();
    }
  }

  private setupGenerators(): void {
    // Always common generators
    this.generators.push(
      new IndigoDBSchemaGenerator(this.projectDir, this.options)
    );

    // Only if full-project
    if (this.options.mode === "full-project") {
      this.generators.push(
        new ReadmeGenerator(this.projectDir, this.options),
        new GitignoreGenerator(this.projectDir, this.options),
        new TsconfigGenerator(this.projectDir, this.options),
        new SrcFolderGenerator(this.projectDir, this.options),
        new PackageJsonGenerator(this.projectDir, this.options),
        new ProjectConfigGenerator(this.projectDir, this.options)
      );

      if (this.options.architecture === "Simple") {
        this.generators.push(
          new SimpleAppGenerator(this.projectDir, this.options)
        );
      }

      if (this.options.architecture === "Clean") {
        this.generators.push(
          new CleanDomainGenerator(this.projectDir, this.options),
          new CleanApplicationGenerator(this.projectDir, this.options),
          new CleanInfrastructureGenerator(this.projectDir, this.options),
          new CleanInterfacesGenerator(this.projectDir, this.options)
        );
      }
    }
  }
}
