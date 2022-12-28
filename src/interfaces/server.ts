import EventEmitter from 'events'

export interface ILogMessageListener {}
export interface IServer extends EventEmitter {
  startListening(): Promise<void>
  onLogMessage(listener: ILogMessageListener): void
  offLogMessage(listener: ILogMessageListener): void
}
