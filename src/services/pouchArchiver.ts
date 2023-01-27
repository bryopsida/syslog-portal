import { injectable, inject, preDestroy, postConstruct } from 'inversify'
import { ILogMessage, ILogMessageListener, IServer } from '../interfaces/server'
import { TYPES } from '../types'
import { Logger } from 'pino'
import PouchDB from 'pouchdb'
import { randomUUID } from 'crypto'
import { IConfig } from '../models/config'
import { mkdirSync } from 'fs'
import { rmdir } from 'fs/promises'
import { resolve, join } from 'node:path'

@injectable()
export class PouchArchiver implements ILogMessageListener {
  private readonly server: IServer
  private readonly log: Logger
  private localDatabase: PouchDB.Database
  private remoteDatabase: PouchDB.Database
  private readonly syncInterval: ReturnType<typeof setInterval>
  private readonly dataFolder: string
  private activeLocalDataFolder: string | undefined

  constructor(
    @inject(TYPES.Services.Server) server: IServer,
    @inject(TYPES.Configurations.Main) config: IConfig,
    @inject(TYPES.Logger) log: Logger,
    @inject(TYPES.Connections.Database) db: PouchDB.Database
  ) {
    log.info('Creating pouchdb archiver')
    this.server = server
    this.log = log
    this.dataFolder = config.archiver.databaseFolder as string
    this.localDatabase = this.createDatabase()
    this.remoteDatabase = db
    this.syncInterval = setInterval(
      this.sync.bind(this),
      config.archiver.syncInterval
    ) // 5 minute sync
  }

  createDatabase(): PouchDB.Database {
    const folder = join(resolve(this.dataFolder), randomUUID())
    this.activeLocalDataFolder = folder
    const db = join(folder, 'syslog')
    mkdirSync(db, {
      recursive: true,
    })
    return new PouchDB(db)
  }

  async sync(): Promise<void> {
    this.log.info('syncing to remote')
    // swap databases, there isn't a purge to forget to keep things small here
    // we have to torch the local database and swap
    const oldDatabase = this.localDatabase
    const oldFolder = this.activeLocalDataFolder
    this.localDatabase = this.createDatabase()
    try {
      await oldDatabase.replicate.to(this.remoteDatabase)
      this.log.info('finished syncing to remote')
    } catch (err) {
      this.log.error(
        err,
        'error while syncing to remote, syncing back to local copy'
      )
      await oldDatabase.replicate.to(this.localDatabase)
    }
    this.log.info('destroying previous sync interval copy')
    await oldDatabase.destroy()
    if (oldFolder) {
      await rmdir(resolve(oldFolder))
    }
    this.log.info('finished destroying previous sync')
  }

  @postConstruct()
  setup() {
    this.log.info('Registering archiver listener with server')
    this.server.onLogMessage(this)
  }

  @preDestroy()
  async cleanUp() {
    this.log.info('Deregistering archiver listener from server')
    this.server.offLogMessage(this)
    clearInterval(this.syncInterval)
    await this.sync()
    await this.localDatabase.close()
  }

  async onLogMessage(message: ILogMessage): Promise<any> {
    await this.localDatabase.put({
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
