// tests/realtime.test.ts

import ORM from "../src/orm";
import { DataTypes } from "../src/dataTypes";
import WebSocket from "ws";
import dotenv from "dotenv";
dotenv.config();

interface TestUser {
  _id: number;
  name: string;
  email: string;
}

describe("Real-time Updates", () => {
  let orm: ORM;
  let UserModel: any;
  let ws: WebSocket;
  let messages: any[] = [];

  beforeAll(async () => {
    orm = new ORM();
    await orm.initialize({
      databaseType: "postgresql", // mongodb | postgresql
      host: "localhost",
      port: 5432,
      user: "adinet",
      password: "Nopassword1!",
      database: "indigodb_test",
      websocketPort: 8083,
    });

    UserModel = orm.defineModel<TestUser>("test_realtime_users", {
      _id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING },
      email: { type: DataTypes.STRING, unique: true },
    });

    // Conectar al servidor WebSocket
    ws = new WebSocket("ws://localhost:8083");

    ws.on("message", (data) => {
      const message = JSON.parse(data.toString());
      messages.push(message);
    });

    // Esperar a que se establezca la conexión
    await new Promise((resolve) => ws.on("open", resolve));
  });

  afterAll(async () => {
    await orm.client?.query("DROP TABLE IF EXISTS test_realtime_users;");
    await orm.client?.end();
    ws.close();
    await new Promise((resolve) => ws.on("close", resolve));
  });

  test("should receive real-time updates on create", async () => {
    const user = await UserModel.create({
      name: "Real-time User",
      email: "realtime@example.com",
    });

    // Esperar un poco para que llegue el mensaje
    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(messages.length).toBeGreaterThan(0);
    const lastMessage = messages[messages.length - 1];
    expect(lastMessage.event).toBe("databaseUpdate");
    expect(lastMessage.data.operation).toBe("INSERT");
    expect(lastMessage.data.model).toBe("test_realtime_users");
    expect(lastMessage.data.data.name).toBe("Real-time User");
  });

  test("should receive real-time updates on update", async () => {
    const users = await UserModel.findAll();
    const user = users[0];
    await UserModel.update(user._id, { name: "Updated Real-time User" });

    // Esperar un poco para que llegue el mensaje
    await new Promise((resolve) => setTimeout(resolve, 500));

    const lastMessage = messages[messages.length - 1];
    expect(lastMessage.data.operation).toBe("UPDATE");
    expect(lastMessage.data.data.name).toBe("Updated Real-time User");
  });

  test("should receive real-time updates on delete", async () => {
    const users = await UserModel.findAll();
    const user = users[0];
    await UserModel.delete(user._id);

    // Esperar un poco para que llegue el mensaje
    await new Promise((resolve) => setTimeout(resolve, 500));

    const lastMessage = messages[messages.length - 1];
    expect(lastMessage.data.operation).toBe("DELETE");
    expect(lastMessage.data.data._id).toBe(user._id);
  });
});
