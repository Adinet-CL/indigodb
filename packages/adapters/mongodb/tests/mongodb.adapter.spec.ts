import { describe, it, beforeAll, afterAll, expect } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoAdapter } from "../src";
import { randomUUID } from "crypto";

const COLLECTION = "test_users";
let mongo: MongoMemoryServer;
let db: MongoAdapter;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  db = new MongoAdapter(mongo.getUri(), "indigodb_test");
  await db.connect();
});

afterAll(async () => {
  await db.disconnect();
  await mongo.stop();
});

describe("MongoAdapter", () => {
  const id = randomUUID();
  it("CRUD flow works", async () => {
    await db.create(COLLECTION, { _id: id, name: "Checho", role: "admin" });
    const user = await db.findById(COLLECTION, id);
    expect(user?.role).toBe("admin");
    await db.update(COLLECTION, id, { role: "superadmin" });
    const cnt = await db.count(COLLECTION, { role: "superadmin" });
    expect(cnt).toBeGreaterThan(0);
    await db.delete(COLLECTION, id);
    const gone = await db.findById(COLLECTION, id);
    expect(gone).toBeNull();
  });
});
