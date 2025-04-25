import { describe, it, expect, vi } from 'vitest'
import { createClient } from '../src/createClient'
import { DatabaseClient } from '@adinet/indigodb-core'

// mocks falsos para adaptadores
vi.mock('@adinet/indigodb-adapter-postgresql', () => {
  return {
    PostgreSQLAdapter: class {
      connect = vi.fn()
      find = vi.fn().mockResolvedValue([{ id: 1, name: 'Checho PG' }])
      findById = vi.fn().mockResolvedValue({ id: 1 })
      create = vi.fn().mockResolvedValue({ id: 1, name: 'New' })
      update = vi.fn().mockResolvedValue({ id: 1, name: 'Updated' })
      delete = vi.fn().mockResolvedValue(true)
      count = vi.fn().mockResolvedValue(1)
    }
  }
})

vi.mock('@adinet/indigodb-adapter-mongodb', () => {
  return {
    MongoAdapter: class {
      connect = vi.fn()
      find = vi.fn().mockResolvedValue([{ _id: '123', name: 'Checho MG' }])
      findById = vi.fn().mockResolvedValue({ _id: '123' })
      create = vi.fn().mockResolvedValue({ _id: '123', name: 'New' })
      update = vi.fn().mockResolvedValue({ _id: '123', name: 'Updated' })
      delete = vi.fn().mockResolvedValue(true)
      count = vi.fn().mockResolvedValue(1)
    }
  }
})

describe('createClient', () => {
  it('should create a DatabaseClient for PostgreSQL', async () => {
    const client = await createClient({
      provider: 'postgresql',
      url: 'postgres://localhost:5432/test',
    })

    expect(client).toBeInstanceOf(DatabaseClient)

    const result = await client.find('users', {})
    expect(result[0].name).toBe('Checho PG')
  })

  it('should create a DatabaseClient for MongoDB', async () => {
    const client = await createClient({
      provider: 'mongodb',
      url: 'mongodb://localhost:27017',
      options: { dbName: 'testdb' },
    })

    expect(client).toBeInstanceOf(DatabaseClient)

    const result = await client.find('users', {})
    expect(result[0].name).toBe('Checho MG')
  })
})
