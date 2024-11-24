// src/types/index.ts

export interface ModelSchema {
  [key: string]: {
    type: string;
    primaryKey?: boolean;
    autoIncrement?: boolean;
    unique?: boolean;
  };
}

export interface Config {
  databaseType: "postgresql" | "mongodb";
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  connectionString?: string;
  websocketPort?: number;
}
