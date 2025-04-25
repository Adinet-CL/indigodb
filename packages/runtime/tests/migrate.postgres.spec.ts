import { describe, it, beforeAll, afterAll, expect } from "vitest";
import { postgresContainer } from "../../../test-utils/containers";
import { PostgresMigrationAdapter } from "../src/migrator/postgres.adapter";
import { parseIndigoSchema } from "../src/parser";
import { schemaV1 } from "../../../test-utils/schemaSamples";
import { Client } from "pg";

let pg: Awaited<ReturnType<typeof postgresContainer>>;
let migrator: PostgresMigrationAdapter;
let client: Client;

beforeAll(async () => {
  pg = await postgresContainer();
  client = new Client({ connectionString: pg.url });
  await client.connect();
  migrator = new PostgresMigrationAdapter(client);
});

afterAll(async () => {
  await client.end();
  await pg.stop();
});

describe("PostgresMigrationAdapter", () => {
  it("migrates schema without throwing", async () => {
    const parsed = parseIndigoSchema(schemaV1);
    await migrator.migrate(parsed.models);
    const res = await client.query("SELECT to_regclass('public.\"User\"') as exists");
    expect(res.rows[0].exists).not.toBeNull();
  });
});