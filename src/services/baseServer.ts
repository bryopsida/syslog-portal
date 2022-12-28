import { EventEmitter } from 'stream'
import { ILogMessageListener, IServer } from '../interfaces/server'
import { IConfig } from '../models/config'

export abstract class BaseServer extends EventEmitter implements IServer {
  protected readonly _port: number

  constructor(config: IConfig) {
    super()
    this._port = config.serverPort
  }

  abstract startListening(): Promise<void>
  abstract onLogMessage(listener: ILogMessageListener): void
  abstract offLogMessage(listener: ILogMessageListener): void
}
