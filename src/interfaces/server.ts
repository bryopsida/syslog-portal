import EventEmitter from 'events'
import { FACILITY, SEVERITY } from '../models/rfc5424'

export interface ILogMessage {
  timestamp?: Date
  severity: SEVERITY
  facility: FACILITY
  message: string
  app?: string
  procId?: number
  msgId?: string
  hostname?: string
  modelVersion: number
}
export interface ILogMessageListener {
  onLogMessage(message: ILogMessage): Promise<any>
}
export interface IServer extends EventEmitter {
  startListening(): Promise<void>
  close(): Promise<void>
  onLogMessage(listener: ILogMessageListener): void
  offLogMessage(listener: ILogMessageListener): void
}
