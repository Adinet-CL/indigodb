import { Client } from 'pg'
import type { IDatabaseAdapter } from '@adinet/indigodb-core'

export class PostgreSQLAdapter implements IDatabaseAdapter {
  private client: Client

  constructor(private url: string) {
    this.client = new Client({ connectionString: url })
  }

  async connect(): Promise<void> {
    await this.client.connect()
  }

  async disconnect(): Promise<void> {
    await this.client.end()
  }

  async find<T>(model: string, query: Record<string, any>): Promise<T[]> {
    const keys = Object.keys(query)
    const values = Object.values(query)
    const where = keys.map((k, i) => `${k} = $${i + 1}`).join(' AND ')
    const sql = `SELECT * FROM ${model} WHERE ${where}`
    const result = await this.client.query(sql, values)
    return result.rows
  }

  async findFirst<T>(model: string, query: Record<string, any>): Promise<T | null> {
    const rows = await this.find<T>(model, query)
    return rows[0] ?? null
  }

  async findById<T>(model: string, id: string): Promise<T | null> {
    const result = await this.client.query(`SELECT * FROM ${model} WHERE id = $1 LIMIT 1`, [id])
    return result.rows[0] ?? null
  }

  async create<T>(model: string, data: Partial<T>): Promise<T> {
    const keys = Object.keys(data)
    const values = Object.values(data)
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ')
    const sql = `INSERT INTO ${model} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`
    const result = await this.client.query(sql, values)
    return result.rows[0]
  }

  async update<T>(model: string, id: string, data: Partial<T>): Promise<T> {
    const keys = Object.keys(data)
    const values = Object.values(data)
    const set = keys.map((k, i) => `${k} = $${i + 1}`).join(', ')
    const sql = `UPDATE ${model} SET ${set} WHERE id = $${keys.length + 1} RETURNING *`
    const result = await this.client.query(sql, [...values, id])
    return result.rows[0]
  }

  async delete(model: string, id: string): Promise<boolean> {
    const result = await this.client.query(`DELETE FROM ${model} WHERE id = $1`, [id])
    return result.rowCount > 0
  }

  async count(model: string, query: Record<string, any>): Promise<number> {
    const keys = Object.keys(query)
    const values = Object.values(query)
    const where = keys.map((k, i) => `${k} = $${i + 1}`).join(' AND ')
    const sql = `SELECT COUNT(*) FROM ${model} WHERE ${where}`
    const result = await this.client.query(sql, values)
    return parseInt(result.rows[0].count, 10)
  }

  async runRawQuery<T = unknown>(query: string, params?: any[]): Promise<T> {
    const result = await this.client.query(query, params)
    return result.rows as T
  }
}
