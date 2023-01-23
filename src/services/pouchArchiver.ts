import { injectable, inject, preDestroy, postConstruct } from 'inversify'
import { ILogMessage, ILogMessageListener, IServer } from '../interfaces/server'
import { TYPES } from '../types'
import { Logger } from 'pino'
import PouchDB from 'pouchdb'
import { randomUUID } from 'crypto'

@injectable()
export class PouchArchiver implements ILogMessageListener {
  private readonly server: IServer
  private readonly log: Logger
  private readonly database: PouchDB.Database

  constructor(
    @inject(TYPES.Services.Server) server: IServer,
    @inject(TYPES.Logger) log: Logger
  ) {
    log.info('Creating pouchdb archiver')
    this.server = server
    this.log = log
    this.database = new PouchDB('syslog')
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
    await this.database.put({
      _id: message.msgId ?? randomUUID(),
      app: message.app,
      timestamp: message.timestamp,
      message: message.message,
      modelVersion: message.modelVersion,
      hostname: message.hostname,
      procId: message.procId,
      severity: message.severity,
      facility: message.facility,
    })
  }
}
