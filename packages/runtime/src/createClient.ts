import {
  DatabaseClient,
  DatabaseConfig,
  IDatabaseAdapter,
  ISocketEmitter,
} from "@adinet/indigodb-core";

// Socket
import { Server } from "socket.io";
import { SocketEmitter } from "@adinet/indigodb-socket";

// Adapters
import { PostgreSQLAdapter } from '@adinet/indigodb-adapter-postgresql'
import { MongoAdapter } from '@adinet/indigodb-adapter-mongodb'

export async function createClient(config: DatabaseConfig): Promise<DatabaseClient> {
  let adapter: IDatabaseAdapter
  let socket: ISocketEmitter | undefined = undefined

  if (config.realtime) {
    const port = config.realtimePort ?? 4000
    const io = new Server(port, {
      cors: {
        origin: config.realtimeOrigins ?? '*'
      }
    })
    socket = new SocketEmitter(io)
  
    if (config.debug) {
      console.log(`[indigodb] Realtime server listening on port ${port}`)
      if (config.realtimeOrigins) {
        console.log(`[indigodb] CORS origins allowed: ${config.realtimeOrigins.join(', ')}`)
      }
    }
  }  

  switch (config.provider) {
    case 'postgresql':
      adapter = new PostgreSQLAdapter(config.url)
      break

    case 'mongodb':
      const dbName = config.options?.dbName as string
      if (!dbName) throw new Error('[MongoAdapter] Missing "dbName" in options')
      adapter = new MongoAdapter(config.url, dbName)
      break

    default:
      throw new Error(`Unsupported provider: ${config.provider}`)
  }

  const client = new DatabaseClient(adapter, config)
  await client.connect()

  return client
}
