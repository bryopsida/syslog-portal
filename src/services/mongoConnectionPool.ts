import { MongoClient, MongoClientOptions } from 'mongodb'
import { IConnPool } from '../interfaces/connPool'
import { inject, injectable, preDestroy } from 'inversify'
import genericPool from 'generic-pool'
import { TYPES } from '../types'
import { IConfig } from '../models/config'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { Logger } from 'pino'

@injectable()
export class MongoConnPool implements IConnPool<MongoClient> {
  private readonly pool: genericPool.Pool<MongoClient>
  private readonly config: IConfig
  private readonly log: Logger

  constructor(
    @inject(TYPES.Configurations.Main) config: IConfig,
    @inject(TYPES.Logger) log: Logger
  ) {
    log.info('Creating mongo connection pool')
    this.pool = genericPool.createPool<MongoClient>(this, {
      min: 0,
      max: 10,
      autostart: true,
      acquireTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      evictionRunIntervalMillis: 10000,
    })
    this.config = config
    this.log = log
  }

  getUrl(): string {
    return `mongodb://${this.config.archiver.hostname}:${this.config.archiver.port}/`
  }

  async getUsername(): Promise<string | undefined> {
    if (this.config.archiver.usernameFile == null)
      return Promise.resolve(this.config.archiver.username)
    return await readFile(resolve(this.config.archiver.usernameFile), {
      encoding: 'utf8',
    })
  }

  async getPassword(): Promise<string | undefined> {
    if (this.config.archiver.passwordFile == null)
      return Promise.resolve(this.config.archiver.password)
    return await readFile(resolve(this.config.archiver.passwordFile), {
      encoding: 'utf8',
    })
  }

  async getOptions(): Promise<MongoClientOptions | undefined> {
    return {
      auth: {
        username: await this.getUsername(),
        password: await this.getPassword(),
      },
      ...this.config.archiver.options,
    }
  }

  async create(): Promise<MongoClient> {
    this.log.info('Allocating new mongodb connection')
    return new MongoClient(this.getUrl(), await this.getOptions())
      .connect()
      .catch((err) => {
        this.log.error(
          err,
          'Error occurred while connecting to mongodb %s',
          err.message
        )
        throw err
      })
  }

  async destroy(mongoClient: MongoClient): Promise<void> {
    this.log.info('Destroying mongodb connection')
    await mongoClient.close(true).catch((err) => {
      this.log.error(
        err,
        'Error occurred while closing connection to mongodb %s',
        err.message
      )
      throw err
    })
    this.log.info('Finished destroying mongodb connection')
  }

  connect(): Promise<MongoClient> {
    this.log.debug('Leasing connection')
    return this.pool.acquire()
  }

  release(conn: MongoClient): Promise<void> {
    this.log.debug('Releasing connection')
    return this.pool.release(conn)
  }

  count(): number {
    return this.pool.size
  }

  @preDestroy()
  async clearAll(): Promise<void> {
    try {
      this.log.info('Draining connection pool')
      await this.pool.drain()
      this.log.info('Clearing connection pool')
      await this.pool.clear()
      this.log.info('Finished destroying connection pool')
    } catch (err) {
      this.log.error(err, `Error while clearing connections: ${err}`)
    }
  }
}
