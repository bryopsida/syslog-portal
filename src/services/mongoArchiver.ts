import { injectable, inject, preDestroy, postConstruct } from 'inversify'
import {
  ILogMessage,
  ILogMessageListener,
  IServer,
} from '../interfaces/server.js'
import { TYPES } from '../types.js'
import { Logger } from 'pino'
import { MongoClient } from 'mongodb'
import { IConnPool } from '../interfaces/connPool.js'

@injectable()
export class MongoArchiver implements ILogMessageListener {
  private readonly server: IServer
  private readonly log: Logger
  private readonly pool: IConnPool<MongoClient>

  constructor(
    @inject(TYPES.Services.Server) server: IServer,
    @inject(TYPES.Logger) log: Logger,
    @inject(TYPES.Services.MongoConnPool) pool: IConnPool<MongoClient>,
  ) {
    log.info('Creating mongo archiver')
    this.server = server
    this.log = log
    this.pool = pool
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
    const client = await this.pool.connect()
    try {
      const database = client.db('syslog')
      const messages = database.collection('messages')
      await messages.insertOne(message)
    } finally {
      await this.pool.release(client)
    }
  }
}
