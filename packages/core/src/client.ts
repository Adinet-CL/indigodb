import type { IDatabaseAdapter } from './adapter.interface'
import type { DatabaseConfig } from './types'
import type { ISocketEmitter } from './socket.interface'

export class DatabaseClient {
  constructor(
    private readonly adapter: IDatabaseAdapter,
    private readonly config: DatabaseConfig,
    private readonly socket?: ISocketEmitter
  ) {}

  async connect(): Promise<void> {
    await this.adapter.connect()
  }

  async disconnect(): Promise<void> {
    await this.adapter.disconnect()
  }

  async find<T>(model: string, query: object): Promise<T[]> {
    return this.adapter.find<T>(model, query)
  }

  async findById<T>(model: string, id: string): Promise<T | null> {
    return this.adapter.findById<T>(model, id)
  }

  async findFirst<T>(model: string, query: object): Promise<T | null> {
    return this.adapter.findFirst<T>(model, query)
  }

  async create<T>(model: string, data: Partial<T>): Promise<T> {
    const result = await this.adapter.create<T>(model, data)
    if (this.config.realtime && this.socket) {
      this.socket.emit(`${model}:created`, result)
    }
    return result
  }

  async update<T>(model: string, id: string, data: Partial<T>): Promise<T> {
    const result = await this.adapter.update<T>(model, id, data)
    if (this.config.realtime && this.socket) {
      this.socket.emit(`${model}:updated`, result)
    }
    return result
  }

  async delete(model: string, id: string): Promise<boolean> {
    const result = await this.adapter.delete(model, id)
    if (this.config.realtime && this.socket && result) {
      this.socket.emit(`${model}:deleted`, { id })
    }
    return result
  }

  async count(model: string, query: object): Promise<number> {
    return this.adapter.count(model, query)
  }

  async runRawQuery<T = unknown>(query: string | object, params?: any[]): Promise<T> {
    if (!this.adapter.runRawQuery) {
      throw new Error('runRawQuery is not supported by this adapter')
    }
    return this.adapter.runRawQuery<T>(query, params)
  }

  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    if (!this.adapter.transaction) {
      throw new Error('transaction is not supported by this adapter')
    }
    return this.adapter.transaction(callback)
  }
}
