import { MongoClient, ObjectId, Db } from 'mongodb'
import type { IDatabaseAdapter } from '@adinet/indigodb-core'

export class MongoAdapter implements IDatabaseAdapter {
  private client: MongoClient
  private db: Db

  constructor(private url: string, private dbName: string) {
    this.client = new MongoClient(url)
  }

  async connect(): Promise<void> {
    await this.client.connect()
    this.db = this.client.db(this.dbName)
  }

  async disconnect(): Promise<void> {
    await this.client.close()
  }

  async find<T>(model: string, query: object): Promise<T[]> {
    return this.db.collection(model).find(query).toArray() as Promise<T[]>
  }

  async findFirst<T>(model: string, query: object): Promise<T | null> {
    return this.db.collection(model).findOne(query) as Promise<T | null>
  }

  async findById<T>(model: string, id: string): Promise<T | null> {
    return this.db.collection(model).findOne({ _id: new ObjectId(id) }) as Promise<T | null>
  }

  async create<T>(model: string, data: Partial<T>): Promise<T> {
    const result = await this.db.collection(model).insertOne(data)
    return { _id: result.insertedId, ...data } as T
  }

  async update<T>(model: string, id: string, data: Partial<T>): Promise<T> {
    const result = await this.db.collection(model).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: data },
      { returnDocument: 'after' }
    )
    return result?.value as T
  }

  async delete(model: string, id: string): Promise<boolean> {
    const result = await this.db.collection(model).deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  async count(model: string, query: object): Promise<number> {
    return this.db.collection(model).countDocuments(query)
  }

  async runRawQuery<T = unknown>(query: string | object): Promise<T> {
    const command = typeof query === 'string' ? JSON.parse(query) : query
    return this.db.command(command) as T
  }  
}
