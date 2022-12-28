import { IServer } from '../interfaces/server'
import { IConfig } from '../models/config'

export interface IServerFactory {
  createServer(config: IConfig): IServer
}

export class ServerFactory implements IServerFactory {
  createServer(config: IConfig): IServer {
    throw new Error('Method not implemented.')
  }
}
