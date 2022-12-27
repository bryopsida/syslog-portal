import { inject, injectable } from "inversify"
import Pino, { Logger, LoggerOptions } from "pino"
import { TYPES } from "../types"

export interface ILoggerFactory {
  createLogger(): Logger
}

@injectable()
export class LoggerFactory implements ILoggerFactory {
  private readonly _options: LoggerOptions
  private readonly _base: Logger

  constructor(@inject(TYPES.Configurations.Logger) logOptions: LoggerOptions) {
    this._options = logOptions
    this._base = Pino(this._options)
  }

  createLogger(): Logger {
    return this._base.child({})
  }
}
