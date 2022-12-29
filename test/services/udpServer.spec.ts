import { describe, it, expect } from '@jest/globals'
import pino from 'pino'
import { UDPServer } from '../../src/services/udpServer'
import { ServerTypeEnum } from '../../src/models/config'

describe('UDPServer', () => {
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
            mode: 'udp',
            address: '127.0.0.1',
            port: 8001,
          },
        },
      ],
    })
    const log = pino(transport)
    const logger = pino()
    const server = new UDPServer(
      {
        serverPort: 8001,
        serverType: ServerTypeEnum.UDP,
      },
      logger
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
    // TODO: add expectations
    await new Promise((resolve) => setTimeout(resolve, 2500))
    await server.close()
    expect(state.called).toBeTruthy()
  })
})
