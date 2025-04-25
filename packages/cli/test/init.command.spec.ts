import { describe, it, expect, beforeAll } from "vitest";
import { execa } from "execa";
import { join, resolve } from "path";
import { tmpdir } from "os";
import { mkdtempSync } from "fs";

describe("CLI init", () => {
  it("generates files", async () => {
    const dir = mkdtempSync(join(tmpdir(), "indigodb-"));

    await execa("pnpm", ["--filter", "cli", "run", "build"]);

    const cliDist = resolve(__dirname, "../../dist/cli/index.js");
    await execa("node", [cliDist, "init", "--yes"], { cwd: dir });

    const files = await(await import("fs/promises")).readdir(dir);
    expect(files).toContain("indigodb.schema");
    expect(files).toContain(".env");
  });
});