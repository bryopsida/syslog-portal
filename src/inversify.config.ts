import "reflect-metadata"
import { Container, interfaces } from "inversify"
import { TYPES } from "./types"
import { Echo, IEcho } from "./services/echo"
import { IEchoConfig } from "./models/echoConfig"
import config from "config"
import { Logger, LoggerOptions } from "pino"
import { ILoggerFactory, LoggerFactory } from "./logger/logger"

const appContainer = new Container()

appContainer.bind<IEcho>(TYPES.Services.Echo).to(Echo)

appContainer
  .bind<IEchoConfig>(TYPES.Configurations.Echo)
  .toConstantValue(config.get<IEchoConfig>("echo"))

appContainer
  .bind<LoggerOptions>(TYPES.Configurations.Logger)
  .toConstantValue(config.get<LoggerOptions>("logger"))

appContainer
  .bind<ILoggerFactory>(TYPES.Factories.LoggerFactory)
  .to(LoggerFactory)

appContainer
  .bind<Logger>(TYPES.Logger)
  .toDynamicValue((ctx: interfaces.Context) => {
    const factory = ctx.container.get<ILoggerFactory>(
      TYPES.Factories.LoggerFactory
    )
    return factory.createLogger()
  })
export { appContainer }
