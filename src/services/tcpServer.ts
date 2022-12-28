import { BaseServer } from './baseServer'
import { Server, Socket, createServer } from 'node:net'

export class TCPServer extends BaseServer {
  server?: Server
  connections = new Set<Socket>()
  startListening(): Promise<void> {
    this.server = createServer()
    this.server?.listen(this._port)
    this.server?.on('connection', (clientSocket) => {
      this.connections.add(clientSocket)
      clientSocket.on('close', () => {
        this.connections.delete(clientSocket)
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
    return Promise.resolve()
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server?.close((err) => {
        if (err) return reject(err)
        return resolve()
      })
      this.connections.forEach((c) => c.end())
    })
  }
}
