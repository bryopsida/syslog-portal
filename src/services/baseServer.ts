import { EventEmitter } from 'stream'
import { ILogMessage, ILogMessageListener, IServer } from '../interfaces/server'
import { IConfig } from '../models/config'

export abstract class BaseServer extends EventEmitter implements IServer {
  protected readonly _port: number
  protected readonly _listeners = new Set<ILogMessageListener>()

  constructor(config: IConfig) {
    super()
    this._port = config.serverPort
  }

  abstract startListening(): Promise<void>
  abstract close(): Promise<void>

  protected parseMessage(data: Buffer, remoteInfo: any): void {}

  protected async emitLogMessage(message: ILogMessage): Promise<void> {
    for (const listener of this._listeners) {
      await listener.onLogMessage(message)
    }
  }

  public onLogMessage(listener: ILogMessageListener): void {
    this._listeners.add(listener)
  }

  public offLogMessage(listener: ILogMessageListener): void {
    this._listeners.delete(listener)
  }
}
