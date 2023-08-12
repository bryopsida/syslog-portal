import 'reflect-metadata'
import { Container, interfaces } from 'inversify'
import { TYPES } from './types.js'
import { ArchiverType, IConfig } from './models/config.js'
import config from 'config'
import { Logger, LoggerOptions } from 'pino'
import { ILoggerFactory, LoggerFactory } from './logger/logger.js'
import { IServerFactory, ServerFactory } from './factories/serverFactory.js'
import { ILogMessageListener, IServer } from './interfaces/server.js'
import { MetricServer } from './services/metricServer.js'
import { IWatchDog } from './interfaces/watchDog.js'
import { HealthMonitor } from './services/healthMonitor.js'
import { MongoArchiver } from './services/mongoArchiver.js'
import { IConnPool } from './interfaces/connPool.js'
import { MongoClient } from 'mongodb'
import { MongoConnPool } from './services/mongoConnectionPool.js'
import { PouchArchiver } from './services/pouchArchiver.js'
import PouchDB from 'pouchdb'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const defaultConfig = JSON.parse(
  readFileSync(join(__dirname, 'config', 'default.json'), {
    encoding: 'utf8',
  }),
)

const appContainer = new Container()
const appConfig = config.has('server')
  ? config.get<IConfig>('server')
  : defaultConfig.server
const logConfig = config.has('logger')
  ? config.get<LoggerOptions>('logger')
  : defaultConfig.logger

appContainer.bind<IConfig>(TYPES.Configurations.Main).toConstantValue(appConfig)

appContainer
  .bind<LoggerOptions>(TYPES.Configurations.Logger)
  .toConstantValue(logConfig)

appContainer
  .bind<ILoggerFactory>(TYPES.Factories.LoggerFactory)
  .to(LoggerFactory)
  .inSingletonScope()

appContainer
  .bind<IServerFactory>(TYPES.Factories.ServerFactory)
  .to(ServerFactory)
  .inSingletonScope()

appContainer
  .bind<IWatchDog>(TYPES.Services.HealthMonitor)
  .to(HealthMonitor)
  .inSingletonScope()

appContainer
  .bind<MetricServer>(TYPES.Services.MetricServer)
  .to(MetricServer)
  .inSingletonScope()

appContainer
  .bind<Logger>(TYPES.Logger)
  .toDynamicValue((ctx: interfaces.Context) => {
    const factory = ctx.container.get<ILoggerFactory>(
      TYPES.Factories.LoggerFactory,
    )
    return factory.createLogger()
  })

if (appConfig.archiver.enabled) {
  if (appConfig.archiver.type === ArchiverType.MONGO) {
    appContainer
      .bind<IConnPool<MongoClient>>(TYPES.Services.MongoConnPool)
      .to(MongoConnPool)
      .inSingletonScope()

    appContainer
      .bind<ILogMessageListener>(TYPES.Listeners.MongoArchiver)
      .to(MongoArchiver)
      .inSingletonScope()
  } else if (appConfig.archiver.type === ArchiverType.POUCHDB) {
    appContainer
      .bind<PouchDB.Database>(TYPES.Connections.Database)
      .toDynamicValue((ctx) => {
        const config: IConfig = ctx.container.get<IConfig>(
          TYPES.Configurations.Main,
        )
        return new PouchDB(
          `${config.archiver.proto}://${config.archiver.hostname}:${config.archiver.port}/syslog`,
          {
            auth: {
              username:
                config.archiver.usernameFile != null
                  ? readFileSync(config.archiver.usernameFile, {
                      encoding: 'utf8',
                    })
                  : config.archiver.username,
              password:
                config.archiver.passwordFile != null
                  ? readFileSync(config.archiver.passwordFile, {
                      encoding: 'utf8',
                    })
                  : config.archiver.password,
            },
          },
        )
      })
      .inSingletonScope()

    appContainer
      .bind<ILogMessageListener>(TYPES.Listeners.PouchArchiver)
      .to(PouchArchiver)
      .inSingletonScope()
  }
}

appContainer
  .bind<IServer>(TYPES.Services.Server)
  .toDynamicValue(async (ctx: interfaces.Context) => {
    const factory = ctx.container.get<IServerFactory>(
      TYPES.Factories.ServerFactory,
    )
    const config = ctx.container.get<IConfig>(TYPES.Configurations.Main)
    const logger = ctx.container.get<Logger>(TYPES.Logger)
    const monitor = await ctx.container.getAsync<IWatchDog>(
      TYPES.Services.HealthMonitor,
    )
    return factory.createServer(config, logger, monitor)
  })
  .inSingletonScope()
export { appContainer }
