import { injectable, inject, preDestroy, postConstruct } from 'inversify'
import { ILogMessage, ILogMessageListener, IServer } from '../interfaces/server'
import { TYPES } from '../types'
import { Logger } from 'pino'

@injectable()
export class MongoArchiver implements ILogMessageListener {
  private readonly server: IServer
  private readonly log: Logger

  constructor(
    @inject(TYPES.Services.Server) server: IServer,
    @inject(TYPES.Logger) log: Logger
  ) {
    this.server = server
    this.log = log
  }

  @postConstruct()
  setup() {
    this.server.onLogMessage(this)
  }

  @preDestroy()
  cleanUp() {
    this.server.offLogMessage(this)
  }

  onLogMessage(message: ILogMessage): Promise<any> {
    throw new Error('Method not implemented.')
  }
}
