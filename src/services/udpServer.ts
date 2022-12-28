import { ILogMessageListener } from '../interfaces/server'
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
        const stringMsg = msg.toString('utf8')
        console.log(stringMsg, rinfo)
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

  onLogMessage(listener: ILogMessageListener): void {}

  offLogMessage(listener: ILogMessageListener): void {}
}
