import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import 'reflect-metadata'
import { StartedMongoDBContainer, MongoDBContainer } from '@testcontainers/mongodb'
import { MongoConnPool } from '../../src/services/mongoConnectionPool'
import pino from 'pino'
import { ArchiverType, ServerTypeEnum } from '../../src/models/config'
import { MongoArchiver } from '../../src/services/mongoArchiver'
import { ILogMessage, ILogMessageListener } from '../../src/interfaces/server'
import { FACILITY, SEVERITY } from '../../src/models/rfc5424'

describe('MongoArchiver', () => {
  let mongo: StartedMongoDBContainer
  let pool: MongoConnPool

  beforeEach(async () => {
    mongo = await new MongoDBContainer().start()
    const logs = await mongo.logs()
    logs.pipe(process.stdout)
    pool = new MongoConnPool(
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
  })
  afterEach(async () => {
    await pool?.clearAll()
    await mongo?.stop()
  })
  it('persists log messages to mongodb', async () => {
    let listener: ILogMessageListener | null = null

    const mongoArchiver = new MongoArchiver(
      {
        onLogMessage: (l: ILogMessageListener) => {
          listener = l
        },
        offLogMessage: () => {
          listener = null
        },
      } as any,
      pino(),
      pool
    )
    mongoArchiver.setup()
    expect(listener).toBeDefined()
    await (listener as unknown as ILogMessageListener).onLogMessage({
      severity: SEVERITY.ALERT,
      facility: FACILITY.KERNEL,
      modelVersion: 0,
      message: 'test',
    })

    // lets pull it out of mongo and verify its there
    const client = await pool.connect()
    try {
      const db = client.db('syslog')
      const collection = db.collection('messages')
      const msg: ILogMessage | null = await collection.findOne<ILogMessage>({
        message: 'test',
      })
      expect(msg).toBeDefined()
      expect(msg?.severity).toEqual(SEVERITY.ALERT)
      expect(msg?.facility).toEqual(FACILITY.KERNEL)
      expect(msg?.message).toEqual('test')
      expect(msg?.modelVersion).toEqual(0)
    } finally {
      await pool.release(client)
    }
  })
})
