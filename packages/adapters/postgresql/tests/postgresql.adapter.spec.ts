import { describe, it, beforeAll, afterAll, expect } from "vitest";
import { postgresContainer } from "../../../../test-utils/containers";
import { PostgreSQLAdapter } from "../src";
import { randomUUID } from "crypto";

const TABLE = "test_users";
let db: PostgreSQLAdapter;
let pg: Awaited<ReturnType<typeof postgresContainer>>;

beforeAll(async () => {
  pg = await postgresContainer();
  db = new PostgreSQLAdapter(pg.url);
  await db.connect();
  await db.runRawQuery(`CREATE TABLE IF NOT EXISTS ${TABLE} (id UUID PRIMARY KEY, name TEXT NOT NULL, role TEXT NOT NULL)`);
});

afterAll(async () => {
  await db.runRawQuery(`DROP TABLE IF EXISTS ${TABLE}`);
  await db.disconnect();
  await pg.stop();
});

describe("PostgreSQLAdapter", () => {
  const id = randomUUID();
  it("creates, finds, updates and deletes", async () => {
    await db.create(TABLE, { id, name: "Checho", role: "admin" });
    const found = await db.findById(TABLE, id);
    expect(found?.name).toBe("Checho");
    await db.update(TABLE, id, { role: "superadmin" });
    const counted = await db.count(TABLE, { role: "superadmin" });
    expect(counted).toBe(1);
    const ok = await db.delete(TABLE, id);
    expect(ok).toBe(true);
  });
});
