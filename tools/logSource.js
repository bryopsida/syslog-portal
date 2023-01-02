const pino = require('pino')

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
        port: 1514,
      },
    },
  ],
})
const log = pino(transport)

const timer = setInterval(() => {
  log.info('Hello')
}, 1000)

process.on('SIGINT|SIGTERM', () => {
  clearInterval(timer)
})
