import { describe, it, expect, vi } from 'vitest'
import { DatabaseClient } from '../src/client'
import type { IDatabaseAdapter, ISocketEmitter, DatabaseConfig } from '../src'

const mockAdapter: IDatabaseAdapter = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  find: vi.fn(),
  findFirst: vi.fn(),
  findById: vi.fn(),
  create: vi.fn().mockResolvedValue({ id: 1, name: 'Checho' }),
  update: vi.fn().mockResolvedValue({ id: 1, name: 'Updated' }),
  delete: vi.fn().mockResolvedValue(true),
  count: vi.fn(),
}

describe('DatabaseClient realtime', () => {
  it('should emit socket event on create if realtime is enabled', async () => {
    const emit = vi.fn()
    const socket: ISocketEmitter = { emit }

    const config: DatabaseConfig = {
      provider: 'postgresql',
      url: 'fake-url',
      realtime: true
    }

    const client = new DatabaseClient(mockAdapter, config, socket)
    await client.create('users', { name: 'Checho' })

    expect(emit).toHaveBeenCalledWith('users:created', { id: 1, name: 'Checho' })
  })

  it('should NOT emit socket event if realtime is false', async () => {
    const emit = vi.fn()
    const socket: ISocketEmitter = { emit }

    const config: DatabaseConfig = {
      provider: 'postgresql',
      url: 'fake-url',
      realtime: false
    }

    const client = new DatabaseClient(mockAdapter, config, socket)
    await client.create('users', { name: 'Checho' })

    expect(emit).not.toHaveBeenCalled()
  })

  it('should NOT throw if socket is missing and realtime is false', async () => {
    const config: DatabaseConfig = {
      provider: 'postgresql',
      url: 'fake-url'
    }

    const client = new DatabaseClient(mockAdapter, config)
    const result = await client.create('users', { name: 'Checho' })
    expect(result.name).toBe('Checho')
  })
})
