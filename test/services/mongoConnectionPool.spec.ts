import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import 'reflect-metadata'
import { StartedMongoDBContainer, MongoDBContainer } from '@testcontainers/mongodb'
import { MongoConnPool } from '../../src/services/mongoConnectionPool'
import { ArchiverType, ServerTypeEnum } from '../../src/models/config'
import pino from 'pino'

describe('MongoConnPool', () => {
  let mongo: StartedMongoDBContainer

  beforeEach(async () => {
    mongo = await new MongoDBContainer().start()
    const logs = await mongo.logs()
    logs.pipe(process.stdout)
  })
  afterEach(async () => {
    await mongo?.stop()
  })
  it('provides a connected mongo client', async () => {
    const pool = new MongoConnPool(
      {
        serverPort: 1,
        serverType: ServerTypeEnum.TCP,
        archiver: {
          enabled: true,
          type: ArchiverType.MONGO,
          port: mongo.getMappedPort(27017),
          hostname: mongo.getHost(),
          options: {
            directConnection: true,
          },
        },
      },
      pino()
    )
    const conn = await pool.connect()
    try {
      const database = conn.db('syslog')
      const messages = database.collection('messages')
      await messages.insertOne({
        test: 'test',
      })
      const fetchedMessage: any = await messages.findOne({
        test: 'test',
      })
      expect(fetchedMessage).toBeDefined()
      expect(fetchedMessage.test).toEqual('test')
    } finally {
      await pool.release(conn)
      await pool.clearAll()
    }
  })
  it('can clean all connections', async () => {
    const pool = new MongoConnPool(
      {
        serverPort: 1,
        serverType: ServerTypeEnum.TCP,
        archiver: {
          enabled: true,
          type: ArchiverType.MONGO,
          port: mongo.getMappedPort(27017),
          hostname: mongo.getHost(),
          options: {
            directConnection: true,
          },
        },
      },
      pino()
    )
    const client = await pool.connect()
    try {
      await pool.release(client)
      await pool.clearAll()
      expect(pool.count()).toEqual(0)
    } finally {
      await pool.clearAll()
    }
  })
})
