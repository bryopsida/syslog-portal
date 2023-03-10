import { injectable } from 'inversify'
import { ILogMessage, ILogMessageListener } from '../interfaces/server.js'

@injectable()
export class KafkaBroadcaster implements ILogMessageListener {
  onLogMessage(message: ILogMessage): Promise<any> {
    throw new Error('Method not implemented.')
  }
}
