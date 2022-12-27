const TYPES = {
  Services: {
    Echo: Symbol.for("Echo"),
  },
  Logger: Symbol.for("Logger"),
  Factories: {
    LoggerFactory: Symbol.for("LoggerFactory"),
  },
  Configurations: {
    Echo: Symbol.for("Config"),
    Logger: Symbol.for("LoggerOptions"),
  },
}
export { TYPES }
