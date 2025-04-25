import { describe, it, beforeAll, afterAll, expect } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoAdapter } from "../src";
import { ObjectId } from "mongodb";

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
  const id = new ObjectId();
  const idStr = id.toHexString();
  it("CRUD flow works", async () => {
    await db.create(COLLECTION, { id: id, name: "Checho", role: "admin" });
    const user = await db.findById(COLLECTION, idStr);
    console.log(user);
    
    await db.update(COLLECTION, idStr, { role: "superadmin" });
    const cnt = await db.count(COLLECTION, { role: "superadmin" });
    expect(cnt).toBeGreaterThan(0);
    await db.delete(COLLECTION, idStr);
    const gone = await db.findById(COLLECTION, idStr);
    expect(gone).toBeNull();
  });
});
