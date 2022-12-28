import { injectable } from 'inversify'
import { ILogMessage, ILogMessageListener } from '../interfaces/server'

@injectable()
export class MessageArchiver implements ILogMessageListener {
  onLogMessage(message: ILogMessage): Promise<any> {
    throw new Error('Method not implemented.')
  }
}
