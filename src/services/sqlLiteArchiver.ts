import { injectable } from 'inversify'
import { ILogMessage, ILogMessageListener } from '../interfaces/server'

@injectable()
export class SqlLiteArchiver implements ILogMessageListener {
  onLogMessage(message: ILogMessage): Promise<any> {
    throw new Error('Method not implemented.')
  }
}
