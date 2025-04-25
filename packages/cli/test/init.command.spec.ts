import { describe, it, expect } from "vitest";
import { execa } from "execa";
import { join } from "path";
import { tmpdir } from "os";
import { mkdtempSync } from "fs";

describe("CLI init", () => {
  it("generates files", async () => {
    const dir = mkdtempSync(join(tmpdir(), "indigodb-"));
    await execa("node", ["../../dist/cli", "init", "--yes"], { cwd: dir });
    const fs = await import("fs/promises");
    const files = await fs.readdir(dir);
    expect(files).toContain("indigodb.schema");
    expect(files).toContain(".env");
  });
});