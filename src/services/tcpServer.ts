import { randomUUID } from 'node:crypto'
import { BaseServer } from './baseServer'
import { Server, Socket, createServer } from 'node:net'

export class TCPServer extends BaseServer {
  _server?: Server
  _connections = new Set<Socket>()
  _checkIn?: ReturnType<typeof setInterval>

  startListening(): Promise<void> {
    this._server = createServer()
    this._server?.listen(this._port)
    this._server?.on('connection', (clientSocket) => {
      this._connections.add(clientSocket)
      clientSocket.on('close', () => {
        this._connections.delete(clientSocket)
      })
      clientSocket.on('end', () => {
        clientSocket.end()
      })
      clientSocket.on('data', (buffer) => {
        this.parseMessage(buffer, {
          address: clientSocket.remoteAddress,
          port: clientSocket.remotePort,
          family: clientSocket.remoteFamily,
        })
      })
    })
    this._entityId = randomUUID()
    this._healthMonitor.register(this._entityId as string, 'TCPServer', 20000)
    this._checkIn = setInterval(this.pingMonitor.bind(this), 15000)
    return Promise.resolve()
  }

  close(): Promise<void> {
    if (this._checkIn) clearInterval(this._checkIn)
    this._healthMonitor.unregister(this._entityId as string)
    return new Promise((resolve, reject) => {
      this._server?.close((err) => {
        if (err) return reject(err)
        return resolve()
      })
      this._connections.forEach((c) => c.end())
    })
  }
}
