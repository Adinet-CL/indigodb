// tests/orm.test.ts

import ORM from "../src/orm";
import { Config } from "../src/types";

describe("ORM Class", () => {
  let orm: ORM;

  beforeEach(() => {
    orm = new ORM();
  });

  test("should initialize with PostgreSQL configuration", async () => {
    const config: Config = {
      databaseType: "postgresql",
      host: "localhost",
      port: 5432,
      user: "adinet",
      password: "Nopassword1!",
      database: "indigodb_test",
      websocketPort: 8081,
    };

    await orm.initialize(config);

    expect(orm.client).toBeDefined();
    expect(orm.client?.database).toBe("indigodb_test");
    expect(orm.mongoClient).toBeUndefined();
  });

  test("should initialize with MongoDB configuration", async () => {
    const config: Config = {
      databaseType: "mongodb",
      connectionString: "mongodb://localhost:27017/indigodb_test",
      websocketPort: 8082,
    };

    await orm.initialize(config);

    expect(orm.mongoClient).toBeDefined();
    expect(orm.mongoDb).toBeDefined();
    expect(orm.client).toBeUndefined();
  });

  test("should throw error for unsupported database type", async () => {
    const config: Config = {
      databaseType: "unsupported_db",
    } as any;

    await expect(orm.initialize(config)).rejects.toThrow(
      "Tipo de base de datos no soportado"
    );
  });
});
