
import { injectable, inject, preDestroy, postConstruct } from 'inversify'
import { ILogMessage, ILogMessageListener, IServer } from '../interfaces/server'
import { TYPES } from '../types'
import { Logger } from 'pino'

@injectable()
export class PouchArchiver implements ILogMessageListener {
  private readonly server: IServer
  private readonly log: Logger

  constructor(
    @inject(TYPES.Services.Server) server: IServer,
    @inject(TYPES.Logger) log: Logger,
  ) {
    log.info('Creating pouchdb archiver')
    this.server = server
    this.log = log
  }

  @postConstruct()
  setup() {
    this.log.info('Registering archiver listener with server')
    this.server.onLogMessage(this)
  }

  @preDestroy()
  cleanUp() {
    this.log.info('Deregistering archiver listener from server')
    this.server.offLogMessage(this)
  }

  async onLogMessage(message: ILogMessage): Promise<any> {
    try {
    } finally {
    }
  }
}
