// src/orm.ts

import { Client as PostgresClient } from "pg";
import { MongoClient, Db } from "mongodb";
import WebSocket, { Server as WebSocketServer } from "ws";
import { EventEmitter } from "events";

import PostgresModel from "./models/postgresModel";
import MongoModel from "./models/mongoModel";

import { Config, ModelSchema } from "./types";
import { DataTypes } from "./dataTypes";

class ORM extends EventEmitter {
  private models: { [key: string]: any } = {};
  private config!: Config;
  public client?: PostgresClient;
  public mongoClient?: MongoClient;
  public mongoDb?: Db;
  private wss!: WebSocketServer;
  private clients: WebSocket[] = [];

  constructor() {
    super();
  }

  public async initialize(config: Config): Promise<void> {
    this.config = config;

    if (config.databaseType === "postgresql") {
      // Configuración para PostgreSQL
      this.client = new PostgresClient({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
      });

      await this.client.connect();
      await this.setupPostgresListeners();
    } else if (config.databaseType === "mongodb") {
      // Configuración para MongoDB
      if (!config.connectionString) {
        throw new Error("Se requiere connectionString para MongoDB");
      }

      this.mongoClient = new MongoClient(config.connectionString);
      await this.mongoClient.connect();
      this.mongoDb = this.mongoClient.db();

      console.log("Conectado a MongoDB");
    } else {
      throw new Error("Tipo de base de datos no soportado");
    }

    // Iniciar el servidor WebSocket internamente
    this.startWebSocketServer(config.websocketPort || 8080);
  }

  private startWebSocketServer(port: number): void {
    this.wss = new WebSocketServer({ port });
    console.log(`Servidor WebSocket escuchando en el puerto ${port}`);

    this.wss.on("connection", (ws: WebSocket) => {
      this.clients.push(ws);
      console.log("Cliente conectado al servidor WebSocket");

      ws.on("close", () => {
        this.clients = this.clients.filter((client) => client !== ws);
        console.log("Cliente desconectado del servidor WebSocket");
      });
    });
  }

  public broadcast(event: string, data: any): void {
    const message = JSON.stringify({ event, data });
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  public defineModel<T extends { _id: any }>(
    name: string,
    schema: ModelSchema
  ): any {
    if (this.config.databaseType === "postgresql") {
      return this.definePostgresModel<T>(name, schema);
    } else if (this.config.databaseType === "mongodb") {
      return this.defineMongoModel<T>(name, schema);
    } else {
      throw new Error("Tipo de base de datos no soportado");
    }
  }

  private definePostgresModel<T>(name: string, schema: ModelSchema): any {
    const model = new PostgresModel<T>(name, schema, this);
    this.models[name] = model;
    return model;
  }

  private defineMongoModel<T extends { _id: any }>(
    name: string,
    schema: ModelSchema
  ): any {
    const model = new MongoModel<T>(name, schema, this);
    this.models[name] = model;
    return model;
  }

  private async setupPostgresListeners(): Promise<void> {
    await this.client!.query("LISTEN realtime_updates");

    this.client!.on("notification", (msg) => {
      const payload = JSON.parse(msg.payload!);
      // console.log("Notification received from PostgreSQL:", msg.payload);
      this.broadcast("databaseUpdate", payload);
    });
  }
}

export default ORM;
