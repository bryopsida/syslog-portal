import { Container } from 'inversify'
import { TYPES } from './types'
import { Logger } from 'pino'
import { IServer } from './interfaces/server'
import { MetricServer } from './services/metricServer'

export default async function main(appContainer: Container): Promise<void> {
  const server = await appContainer.getAsync<IServer>(TYPES.Services.Server)
  const log = appContainer.get<Logger>(TYPES.Logger)
  // trigger construct
  await appContainer.getAsync<MetricServer>(TYPES.Services.MetricServer)
  log.info('Starting to listen for connections')
  await server.startListening()
  log.info('Now serving connections')
}

if (require.main === module) {
  const appContainer = require('./inversify.config').appContainer as Container
  const log = appContainer.get<Logger>(TYPES.Logger)
  main(appContainer).catch((err) => {
    log.error(err, `Error while launching: ${err.message}`)
  })
}
