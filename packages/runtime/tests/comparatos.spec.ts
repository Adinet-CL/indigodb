import { describe, it, expect } from "vitest";
import { parseIndigoSchema } from "../src/parser";
import { SchemaComparator } from "../src/diff/compareSchemas";
import { schemaV1, schemaV2 } from "../../../test-utils/schemaSamples";

describe("SchemaComparator", () => {
  it("detects added fields", () => {
    const base = parseIndigoSchema(schemaV1);
    const curr = parseIndigoSchema(schemaV2);
    const diffs = new SchemaComparator(base.models, curr.models).compare();
    const fieldAdded = diffs.find(d => d.type === "field_added" && d.field === "email");
    expect(fieldAdded).toBeDefined();
  });
});