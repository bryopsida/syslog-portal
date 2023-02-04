#!/usr/bin/env node
import { Container } from 'inversify'
import { TYPES } from './types.js'
import { Logger } from 'pino'
import { IServer, ILogMessageListener } from './interfaces/server.js'
import { MetricServer } from './services/metricServer.js'
import { ArchiverType, IConfig } from './models/config.js'
import esMain from 'es-main'

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

if (esMain(import.meta)) {
  const appContainer = (await import('./inversify.config.js')).appContainer
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
