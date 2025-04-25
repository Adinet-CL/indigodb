import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { MongoAdapter } from '../src'
import { randomUUID } from 'crypto'
import { MongoClient } from 'mongodb'

const COLLECTION = 'test_users'
const db = new MongoAdapter('mongodb://localhost:27017', 'indigodb_test')

beforeAll(async () => {
  await db.connect()
})

afterAll(async () => {
  // Limpia la colección de pruebas
  const client = new MongoClient('mongodb://localhost:27017')
  await client.connect()
  await client.db('indigodb_test').collection(COLLECTION).drop().catch(() => {})
  await client.close()

  await db.disconnect()
})

describe('MongoAdapter', () => {
  const id = randomUUID()

  it('should create a user', async () => {
    const user = await db.create(COLLECTION, { _id: id, name: 'Checho', role: 'admin' })
    expect(user.name).toBe('Checho')
  })

  it('should find user by id', async () => {
    const user = await db.findById(COLLECTION, id)
    expect(user?.role).toBe('admin')
  })

  it('should update the user', async () => {
    const updated = await db.update(COLLECTION, id, { role: 'superadmin' })
    expect(updated.role).toBe('superadmin')
  })

  it('should count users with role superadmin', async () => {
    const count = await db.count(COLLECTION, { role: 'superadmin' })
    expect(count).toBeGreaterThan(0)
  })

  it('should findFirst the user', async () => {
    const user = await db.findFirst(COLLECTION, { name: 'Checho' })
    expect(user).not.toBeNull()
  })

  it('should delete the user', async () => {
    const deleted = await db.delete(COLLECTION, id)
    expect(deleted).toBe(true)

    const user = await db.findById(COLLECTION, id)
    expect(user).toBeNull()
  })
})
