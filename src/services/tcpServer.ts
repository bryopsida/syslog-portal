import { injectable } from 'inversify'
import { ILogMessageListener } from '../interfaces/server'
import { BaseServer } from './baseServer'

@injectable()
export class TCPServer extends BaseServer {
  startListening(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  onLogMessage(listener: ILogMessageListener): void {
    throw new Error('Method not implemented.')
  }

  offLogMessage(listener: ILogMessageListener): void {
    throw new Error('Method not implemented.')
  }
}
