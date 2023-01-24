import 'reflect-metadata'
import { Container, interfaces } from 'inversify'
import { TYPES } from './types'
import { ArchiverType, IConfig } from './models/config'
import config from 'config'
import { Logger, LoggerOptions } from 'pino'
import { ILoggerFactory, LoggerFactory } from './logger/logger'
import { IServerFactory, ServerFactory } from './factories/serverFactory'
import { ILogMessageListener, IServer } from './interfaces/server'
import { MetricServer } from './services/metricServer'
import { IWatchDog } from './interfaces/watchDog'
import { HealthMonitor } from './services/healthMonitor'
import { MongoArchiver } from './services/mongoArchiver'
import { IConnPool } from './interfaces/connPool'
import { MongoClient } from 'mongodb'
import { MongoConnPool } from './services/mongoConnectionPool'
import { PouchArchiver } from './services/pouchArchiver'

const appContainer = new Container()
const appConfig = config.get<IConfig>('server')

appContainer
  .bind<IConfig>(TYPES.Configurations.Main)
  .toConstantValue(config.get<IConfig>('server'))

appContainer
  .bind<LoggerOptions>(TYPES.Configurations.Logger)
  .toConstantValue(config.get<LoggerOptions>('logger'))

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
      TYPES.Factories.LoggerFactory
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
      .bind<ILogMessageListener>(TYPES.Listeners.PouchArchiver)
      .to(PouchArchiver)
      .inSingletonScope()
  }
}

appContainer
  .bind<IServer>(TYPES.Services.Server)
  .toDynamicValue(async (ctx: interfaces.Context) => {
    const factory = ctx.container.get<IServerFactory>(
      TYPES.Factories.ServerFactory
    )
    const config = ctx.container.get<IConfig>(TYPES.Configurations.Main)
    const logger = ctx.container.get<Logger>(TYPES.Logger)
    const monitor = await ctx.container.getAsync<IWatchDog>(
      TYPES.Services.HealthMonitor
    )
    return factory.createServer(config, logger, monitor)
  })
  .inSingletonScope()
export { appContainer }
