import { inject, injectable } from 'inversify'
import Pino, { Logger, LoggerOptions } from 'pino'
import { TYPES } from '../types'

export interface ILoggerFactory {
  /**
   * Create a logger instance, this is a child logger from a single main logger
   * @returns {Logger} logger instance
   */
  createLogger(): Logger
}

@injectable()
export class LoggerFactory implements ILoggerFactory {
  private readonly _options: LoggerOptions
  private readonly _base: Logger

  /**
   *
   * @param {LoggerOptions} logOptions logger options
   */
  constructor(@inject(TYPES.Configurations.Logger) logOptions: LoggerOptions) {
    this._options = logOptions
    this._base = Pino(this._options)
  }

  /**
   * @inheritDoc
   */
  createLogger(): Logger {
    return this._base.child({})
  }
}
