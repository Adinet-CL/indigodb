// tests/models/postgresModel.test.ts

import ORM from "../../src/orm";
import { DataTypes } from "../../src/dataTypes";

interface TestUser {
  _id: number;
  name: string;
  email: string;
}

describe("PostgresModel", () => {
  let orm: ORM;
  let UserModel: any;

  beforeAll(async () => {
    orm = new ORM();
    await orm.initialize({
      databaseType: "postgresql",
      host: "localhost",
      port: 5432,
      user: "adinet",
      password: "Nopassword1!",
      database: "indigodb_test",
    });

    UserModel = orm.defineModel<TestUser>("test_users", {
      _id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING },
      email: { type: DataTypes.STRING, unique: true },
    });
  });

  afterAll(async () => {
    // Limpiar la tabla después de las pruebas
    await orm.client?.query("DROP TABLE IF EXISTS test_users;");
    await orm.client?.end();
  });

  test("should create a new user", async () => {
    const user = await UserModel.create({
      name: "Test User",
      email: "test@example.com",
    });

    expect(user).toHaveProperty("_id");
    expect(user.name).toBe("Test User");
    expect(user.email).toBe("test@example.com");
  });

  test("should find all users", async () => {
    const users = await UserModel.findAll();
    expect(users.length).toBeGreaterThan(0);
  });

  test("should update a user", async () => {
    const users = await UserModel.findAll();
    const user = users[0];
    const updatedUser = await UserModel.update(user._id, {
      name: "Updated User",
    });
    expect(updatedUser.name).toBe("Updated User");
  });

  test("should delete a user", async () => {
    const usersBefore = await UserModel.findAll();
    const user = usersBefore[0];
    await UserModel.delete(user._id);
    const usersAfter = await UserModel.findAll();
    expect(usersAfter.length).toBe(usersBefore.length - 1);
  });
});
