import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import 'reflect-metadata'
import { GenericContainer, StartedTestContainer } from 'testcontainers'
import pino from 'pino'
import { IConfig } from '../../src/models/config'
import { PouchArchiver } from '../../src/services/pouchArchiver'
import { ILogMessage, ILogMessageListener } from '../../src/interfaces/server'
import { FACILITY, SEVERITY } from '../../src/models/rfc5424'
import PouchDB from 'pouchdb'
import { tmpdir } from 'os'


describe('PouchArchiver', () => {

  let couch: StartedTestContainer
  beforeEach(async () => {
    couch = await new GenericContainer('couchdb')
      .withEnvironment({
        COUCHDB_USER: 'admin',
        COUCHDB_PASSWORD: 'admin',
      })
      .withExposedPorts(5984)
      .start()
    const logs = await couch.logs()
    logs.pipe(process.stdout)
  })
  afterEach(async () => {
    await couch?.stop()
  })
  it('syncs to remote', async () => {
    let listener: ILogMessageListener | null = null
    const db = new PouchDB(
      `http://localhost:${couch.getMappedPort(5984)}/syslog`,
      {
        auth: {
          username: 'admin',
          password: 'admin',
        },
      }
    )

    const archiver = new PouchArchiver(
      {
        onLogMessage: (l: ILogMessageListener) => {
          listener = l
        },
        offLogMessage: () => {
          listener = null
        },
      } as any,
      {
        archiver: {
          syncInterval: 1000,
          databaseFolder: tmpdir(),
          hostname: 'localhost',
          port: couch.getMappedPort(5984),
        },
      } as IConfig,
      pino(),
      db
    )
    archiver.setup()
    expect(listener).toBeDefined()
    await (listener as unknown as ILogMessageListener).onLogMessage({
      severity: SEVERITY.ALERT,
      facility: FACILITY.KERNEL,
      modelVersion: 0,
      message: 'test',
    })

    await new Promise((resolve) => setTimeout(resolve, 2000))

    // lets pull it out of mongo and verify its there
    try {
      const result = await db.allDocs()
      expect(result).toBeDefined()
      expect(result.total_rows).toBe(1)
      const row = result.rows[0]
      const doc = await db.get(row.id) as any as ILogMessage
      expect(doc).toBeDefined()
      expect(doc?.severity).toEqual(SEVERITY.ALERT)
      expect(doc?.facility).toEqual(FACILITY.KERNEL)
      expect(doc?.message).toEqual('test')
      expect(doc?.modelVersion).toEqual(0)
    } finally {
      await archiver.cleanUp()
      await db.close()
    }
  })
})
