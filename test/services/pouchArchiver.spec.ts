import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import 'reflect-metadata'
import { GenericContainer, StartedTestContainer } from 'testcontainers'
import pino from 'pino'
import { IConfig } from '../../src/models/config'
import { PouchArchiver } from '../../src/services/pouchArchiver'
import { ILogMessage, ILogMessageListener } from '../../src/interfaces/server'
import { FACILITY, SEVERITY } from '../../src/models/rfc5424'
import PouchDB from 'pouchdb'
import PouchDBFind from 'pouchdb-find'
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
    const DbFactory = PouchDB.plugin(PouchDBFind)
    const db = new DbFactory(
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
      const result = await db.find({
        selector: {
          message: 'test',
        },
        fields: ['severity', 'facility', 'modelVersion', 'message'],
      })
      expect(result).toBeDefined()
      expect(result.docs.length).toBe(1)
      const msg = result.docs[0] as any as ILogMessage
      expect(msg).toBeDefined()
      expect(msg?.severity).toEqual(SEVERITY.ALERT)
      expect(msg?.facility).toEqual(FACILITY.KERNEL)
      expect(msg?.message).toEqual('test')
      expect(msg?.modelVersion).toEqual(0)
    } finally {
      await db.close()
    }
  })
})
