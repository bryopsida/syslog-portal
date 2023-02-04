import { randomUUID } from 'node:crypto'
import { BaseServer } from './baseServer.js'
import { RemoteInfo, Socket, createSocket } from 'node:dgram'

export class UDPServer extends BaseServer {
  _server?: Socket
  _checkIn?: ReturnType<typeof setInterval>

  async startListening(): Promise<void> {
    this._server = createSocket(
      {
        type: 'udp4',
      },
      (msg: Buffer, rinfo: RemoteInfo) => {
        this.parseMessage(msg, rinfo)
      }
    )
    this._server.bind(this._port, '0.0.0.0')
    this._log.info('Registering with watchdog')
    this._entityId = randomUUID()
    this._healthMonitor.register(this._entityId as string, 'UDPServer', 20000)
    this._checkIn = setInterval(this.pingMonitor.bind(this), 15000)
  }

  close(): Promise<void> {
    this._server?.close()
    if (this._checkIn) clearInterval(this._checkIn)
    this._healthMonitor.unregister(this._entityId as string)
    return Promise.resolve()
  }
}
