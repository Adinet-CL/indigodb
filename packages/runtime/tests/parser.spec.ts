import { describe, it, expect } from "vitest";
import { parseIndigoSchema } from "../src/parser";
import { schemaV1 } from "../../../test-utils/schemaSamples";

describe("Parser", () => {
  const ast = parseIndigoSchema(schemaV1);
  it("parses datasource & generator", () => {
    expect(ast.datasource.provider).toBe("postgresql");
    expect(ast.generator.provider).toBe("indigoclient");
  });
  it("parses models and fields", () => {
    expect(ast.models).toHaveLength(1);
    expect(ast.models[0].fields.map(f => f.name)).toEqual(["id", "name"]);
  });
});