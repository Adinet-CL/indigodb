import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PostgreSQLAdapter } from '../src'
import { randomUUID } from 'crypto'

const TABLE = 'test_users'
const db = new PostgreSQLAdapter('postgres://postgres:postgres@localhost:5432/postgres')

beforeAll(async () => {
  await db.connect()
  await db.runRawQuery(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL
    )
  `)
})

afterAll(async () => {
  await db.runRawQuery(`DROP TABLE IF EXISTS ${TABLE}`)
  await db.disconnect()
})

describe('PostgreSQLAdapter', () => {
  const id = randomUUID()

  it('should create a user', async () => {
    const user = await db.create(TABLE, { id, name: 'Checho', role: 'admin' })
    expect(user.name).toBe('Checho')
    expect(user.role).toBe('admin')
  })

  it('should find the user by id', async () => {
    const user = await db.findById(TABLE, id)
    expect(user?.name).toBe('Checho')
  })

  it('should update the user', async () => {
    const updated = await db.update(TABLE, id, { role: 'superadmin' })
    expect(updated.role).toBe('superadmin')
  })

  it('should count users with role superadmin', async () => {
    const count = await db.count(TABLE, { role: 'superadmin' })
    expect(count).toBeGreaterThan(0)
  })

  it('should find user with findFirst', async () => {
    const user = await db.findFirst(TABLE, { name: 'Checho' })
    expect(user).not.toBeNull()
  })

  it('should delete the user', async () => {
    const deleted = await db.delete(TABLE, id)
    expect(deleted).toBe(true)

    const user = await db.findById(TABLE, id)
    expect(user).toBeNull()
  })
})

