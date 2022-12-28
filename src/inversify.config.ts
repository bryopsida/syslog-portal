import 'reflect-metadata'
import { Container, interfaces } from 'inversify'
import { TYPES } from './types'
import { IConfig } from './models/config'
import config from 'config'
import { Logger, LoggerOptions } from 'pino'
import { ILoggerFactory, LoggerFactory } from './logger/logger'
import { IServerFactory, ServerFactory } from './factories/serverFactory'
import { IServer } from './interfaces/server'

const appContainer = new Container()

appContainer
  .bind<IConfig>(TYPES.Configurations.Main)
  .toConstantValue(config.get<IConfig>('server'))

appContainer
  .bind<LoggerOptions>(TYPES.Configurations.Logger)
  .toConstantValue(config.get<LoggerOptions>('logger'))

appContainer
  .bind<ILoggerFactory>(TYPES.Factories.LoggerFactory)
  .to(LoggerFactory)

appContainer
  .bind<IServerFactory>(TYPES.Factories.ServerFactory)
  .to(ServerFactory)

appContainer
  .bind<Logger>(TYPES.Logger)
  .toDynamicValue((ctx: interfaces.Context) => {
    const factory = ctx.container.get<ILoggerFactory>(
      TYPES.Factories.LoggerFactory
    )
    return factory.createLogger()
  })

appContainer
  .bind<IServer>(TYPES.Services.Server)
  .toDynamicValue((ctx: interfaces.Context) => {
    const factory = ctx.container.get<IServerFactory>(
      TYPES.Factories.ServerFactory
    )
    const config = ctx.container.get<IConfig>(TYPES.Configurations.Main)
    const logger = ctx.container.get<Logger>(TYPES.Logger)
    return factory.createServer(config, logger)
  })
export { appContainer }
