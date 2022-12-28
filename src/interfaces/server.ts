import EventEmitter from 'events'

export interface ILogMessage {}
export interface ILogMessageListener {
  onLogMessage(message: ILogMessage): Promise<any>
}
export interface IServer extends EventEmitter {
  startListening(): Promise<void>
  onLogMessage(listener: ILogMessageListener): void
  offLogMessage(listener: ILogMessageListener): void
}
