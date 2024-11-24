// src/models/postgresModel.ts

import { Client } from "pg";
import { ModelSchema } from "../types";
import ORM from "../orm";

class PostgresModel<T> {
  private name: string;
  private schema: ModelSchema;
  private orm: ORM;
  private client: Client;

  constructor(name: string, schema: ModelSchema, orm: ORM) {
    this.name = name;
    this.schema = schema;
    this.orm = orm;
    this.client = orm.client!;
    this.init();
  }

  private async init(): Promise<void> {
    await this.createTable();
    await this.setupTriggers();
  }

  private async createTable(): Promise<void> {
    const columns: string[] = [];
    for (const [columnName, columnProps] of Object.entries(this.schema)) {
      let columnDef = `${columnName} ${this.mapDataType(columnProps.type)}`;
      if (columnProps.primaryKey) columnDef += " PRIMARY KEY";
      if (columnProps.autoIncrement)
        columnDef += " GENERATED ALWAYS AS IDENTITY";
      if (columnProps.unique) columnDef += " UNIQUE";
      columns.push(columnDef);
    }

    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS ${this.name} (
      ${columns.join(", ")}
    );
  `;

    await this.client.query(createTableQuery);
  }

  private async setupTriggers(): Promise<void> {
    const functionName = `notify_${this.name}_change`;
    const triggerName = `${this.name}_change_trigger`;

    const createFunctionQuery = `
      CREATE OR REPLACE FUNCTION ${functionName}() RETURNS trigger AS $$
      DECLARE
        record RECORD;
        payload TEXT;
      BEGIN
        IF TG_OP = 'DELETE' THEN
          record := OLD;
        ELSE
          record := NEW;
        END IF;
        payload := json_build_object(
          'model', '${this.name}',
          'operation', TG_OP,
          'data', row_to_json(record)
        )::text;
        PERFORM pg_notify('realtime_updates', payload);
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `;

    const createTriggerQuery = `
      DROP TRIGGER IF EXISTS ${triggerName} ON ${this.name};
      CREATE TRIGGER ${triggerName}
      AFTER INSERT OR UPDATE OR DELETE ON ${this.name}
      FOR EACH ROW EXECUTE FUNCTION ${functionName}();
    `;

    await this.client.query(createFunctionQuery);
    await this.client.query(createTriggerQuery);
  }

  public async create(data: Partial<T>): Promise<T> {
    const columns = Object.keys(data).join(", ");
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");

    const insertQuery = `INSERT INTO ${this.name} (${columns}) VALUES (${placeholders}) RETURNING *;`;
    const result = await this.client.query(insertQuery, values);
    return result.rows[0] as T;
  }

  public async findAll(criteria: Partial<T> = {}): Promise<T[]> {
    let query = `SELECT * FROM ${this.name}`;
    const whereClauses: string[] = [];
    const values: any[] = [];

    Object.entries(criteria).forEach(([key, value], index) => {
      whereClauses.push(`${key} = $${index + 1}`);
      values.push(value);
    });

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    const result = await this.client.query(query, values);
    return result.rows as T[];
  }

  public async findById(id: any): Promise<T | null> {
    const query = `SELECT * FROM ${this.name} WHERE _id = $1;`;
    const result = await this.client.query(query, [id]);
    return result.rows[0] ? (result.rows[0] as T) : null;
  }

  public async update(id: any, data: Partial<T>): Promise<T | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let index = 1;

    for (const [key, value] of Object.entries(data)) {
      updates.push(`${key} = $${index++}`);
      values.push(value);
    }

    values.push(id);
    const updateQuery = `UPDATE ${this.name} SET ${updates.join(
      ", "
    )} WHERE _id = $${index} RETURNING *;`;
    const result = await this.client.query(updateQuery, values);
    return result.rows[0] ? (result.rows[0] as T) : null;
  }

  public async delete(id: any): Promise<T | null> {
    const deleteQuery = `DELETE FROM ${this.name} WHERE _id = $1 RETURNING *;`;
    const result = await this.client.query(deleteQuery, [id]);
    return result.rows[0] ? (result.rows[0] as T) : null;
  }

  private mapDataType(type: string): string {
    switch (type) {
      case "INTEGER":
        return "INTEGER";
      case "STRING":
        return "VARCHAR(255)";
      case "FLOAT":
        return "REAL";
      case "BOOLEAN":
        return "BOOLEAN";
      case "DATE":
        return "TIMESTAMP";
      case "TEXT":
        return "TEXT";
      default:
        throw new Error(`Unsupported data type: ${type}`);
    }
  }
}

export default PostgresModel;
