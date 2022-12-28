import { BaseServer } from './baseServer'
import { RemoteInfo, Socket, createSocket } from 'node:dgram'

export class UDPServer extends BaseServer {
  server?: Socket
  startListening(): Promise<void> {
    this.server = createSocket(
      {
        type: 'udp4',
      },
      (msg: Buffer, rinfo: RemoteInfo) => {
        this.parseMessage(msg, rinfo)
      }
    )
    return new Promise((resolve) => {
      return this.server?.bind(this._port, resolve)
    })
  }

  close(): Promise<void> {
    this.server?.close()
    return Promise.resolve()
  }
}
