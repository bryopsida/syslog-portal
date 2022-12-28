import { Container } from 'inversify'
import { TYPES } from './types'
import { Logger } from 'pino'
import { IServer } from './interfaces/server'

export default async function main(appContainer: Container): Promise<void> {
  const server = appContainer.get<IServer>(TYPES.Services.Server)
  const log = appContainer.get<Logger>(TYPES.Logger)
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
