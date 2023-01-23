const TYPES = {
  Services: {
    Server: Symbol.for('Server'),
    MetricServer: Symbol.for('MetricServer'),
    HealthMonitor: Symbol.for('HealthMonitor'),
    MongoConnPool: Symbol.for('MongoConnPool'),
  },
  Listeners: {
    MongoArchiver: Symbol.for('MongoArchiver'),
    PouchArchiver: Symbol.for('PouchArchiver'),
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
