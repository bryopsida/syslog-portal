import { MongoClient, MongoClientOptions } from 'mongodb'
import { IConnPool } from '../interfaces/connPool'
import { inject, injectable, preDestroy } from 'inversify'
import genericPool from 'generic-pool'
import { TYPES } from '../types'
import { IConfig } from '../models/config'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

@injectable()
export class MongoConnPool implements IConnPool<MongoClient> {
  private readonly pool: genericPool.Pool<MongoClient>
  private readonly config: IConfig

  constructor(@inject(TYPES.Configurations.Main) config: IConfig) {
    this.pool = genericPool.createPool<MongoClient>(this, {
      min: 0,
      max: 10,
    })
    this.config = config
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
    return new MongoClient(this.getUrl(), await this.getOptions()).connect()
  }

  async destroy(mongoClient: MongoClient): Promise<void> {
    await mongoClient.close()
  }

  connect(): Promise<MongoClient> {
    return this.pool.acquire()
  }

  release(conn: MongoClient): Promise<void> {
    return this.pool.release(conn)
  }

  @preDestroy()
  async clearAll(): Promise<void> {
    await this.pool.drain()
    await this.pool.clear()
  }
}
