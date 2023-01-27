import { Container } from 'inversify'
import { TYPES } from './types'
import { Logger } from 'pino'
import { IServer, ILogMessageListener } from './interfaces/server'
import { MetricServer } from './services/metricServer'
import { ArchiverType, IConfig } from './models/config'

export default async function main(appContainer: Container): Promise<void> {
  const server = await appContainer.getAsync<IServer>(TYPES.Services.Server)
  const log = appContainer.get<Logger>(TYPES.Logger)
  // trigger construct
  await appContainer.getAsync<MetricServer>(TYPES.Services.MetricServer)

  const config = appContainer.get<IConfig>(TYPES.Configurations.Main)
  if (config.archiver.enabled) {
    if (config.archiver.type === ArchiverType.MONGO) {
      await appContainer.getAsync<ILogMessageListener>(
        TYPES.Listeners.MongoArchiver
      )
    } else if (config.archiver.type === ArchiverType.POUCHDB) {
      await appContainer.getAsync<ILogMessageListener>(
        TYPES.Listeners.PouchArchiver
      )
    }
  }
  log.info('Starting to listen for connections')
  await server.startListening()
  log.info('Now serving connections')
}

if (require.main === module) {
  const appContainer = require('./inversify.config').appContainer as Container
  const log = appContainer.get<Logger>(TYPES.Logger)
  main(appContainer)
    .then(() => {
      process.on('SIGINT|SIGTERM', async () => {
        // trigger preDestroy hooks
        await appContainer.unbindAllAsync()
      })
    })
    .catch((err) => {
      log.error(err, `Error while launching: ${err.message}`)
    })
}
