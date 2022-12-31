import 'reflect-metadata'
import { describe, it, expect } from '@jest/globals'
import pino from 'pino'
import { TCPServer } from '../../src/services/tcpServer'
import { ServerTypeEnum } from '../../src/models/config'
import { HealthMonitor } from '../../src/services/healthMonitor'

describe('TCPServer', () => {
  it('should emit messages when received', async () => {
    // create a logger that will send logs to our server
    const transport = pino.transport({
      pipeline: [
        {
          target: 'pino-syslog',
          options: {
            modern: true,
            appname: 'none',
            cee: false,
            facility: 16,
            includeProperties: [],
            messageOnly: false,
            tz: 'Etc/UTC',
            newline: false,
            structuredData: '-',
          },
        },
        {
          target: 'pino-socket',
          options: {
            mode: 'tcp',
            address: '127.0.0.1',
            port: 8100,
          },
        },
      ],
    })
    const log = pino(transport)
    const logger = pino()
    const monitor = new HealthMonitor(logger)
    const server = new TCPServer(
      {
        serverPort: 8100,
        serverType: ServerTypeEnum.TCP,
      },
      logger,
      monitor
    )
    await server.startListening()
    const state = {
      called: false,
    }
    server.onLogMessage({
      onLogMessage: (msg) => {
        expect(msg.timestamp).toBeDefined()
        expect(msg.facility).toBeDefined()
        expect(msg.hostname).toBeDefined()
        expect(msg.severity).toBeDefined()
        expect(msg.modelVersion).toEqual(1)
        expect(msg.message).toBeDefined()
        const parsedMsg = JSON.parse(msg.message)
        expect(parsedMsg.msg).toEqual('test')
        state.called = true
        return Promise.resolve()
      },
    })
    log.info('test')
    await new Promise((resolve) => setTimeout(resolve, 2500))
    await server.close()
    expect(state.called).toBeTruthy()
  })
})
