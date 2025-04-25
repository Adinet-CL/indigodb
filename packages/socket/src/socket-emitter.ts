import { Server } from 'socket.io'
import type { ISocketEmitter } from '@adinet/indigodb-core'

export class SocketEmitter implements ISocketEmitter {
  constructor(private io: Server) {}

  emit(event: string, payload: any): void {
    this.io.emit(event, payload)
  }
}
