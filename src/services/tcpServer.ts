import { IServer } from '../interfaces/server'
import { IConfig } from '../models/config'

export class TCPServer implements IServer {
  private readonly port: number

  constructor(config: IConfig) {
    this.port = config.serverPort
  }

  startListening(): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
