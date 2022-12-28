import { describe, it } from '@jest/globals'
import pino from 'pino'
import { TCPServer } from '../../src/services/tcpServer'
import { ServerTypeEnum } from '../../src/models/config'

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
    const server = new TCPServer({
      serverPort: 8100,
      serverType: ServerTypeEnum.TCP,
    })
    await server.startListening()
    server.onLogMessage({
      onLogMessage: (msg) => {
        console.log(msg)
        return Promise.resolve()
      },
    })
    log.info('test')
    // TODO: add expectations
    await new Promise((resolve) => setTimeout(resolve, 20000))
    await server.close()
  })
})
