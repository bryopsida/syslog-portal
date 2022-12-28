const TYPES = {
  Services: {
    Server: Symbol.for('Server'),
  },
  Logger: Symbol.for('Logger'),
  Factories: {
    LoggerFactory: Symbol.for('LoggerFactory'),
    ServerFactory: Symbol.for('ServerFactory'),
  },
  Configurations: {
    Main: Symbol.for('Config'),
    Logger: Symbol.for('LoggerOptions'),
  },
}
export { TYPES }
