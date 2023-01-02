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
  /**
   * Handler to process a log message
   * @param {ILogMessage} message received log message
   * @returns {Promise<any>} Promise that resolves once processing of log message has completed
   */
  onLogMessage(message: ILogMessage): Promise<any>
}
export interface IServer extends EventEmitter {
  /**
   * @returns {Promise<void>} start listening for syslog messages, this includes allocating and binding any server ports
   */
  startListening(): Promise<void>
  /**
   * @returns {Promise<void>} close any resources allocated when calling startListening
   */
  close(): Promise<void>
  /**
   *
   * @param {ILogMessageListener} listener listener you wish to receive log message events
   */
  onLogMessage(listener: ILogMessageListener): void
  /**
   *
   * @param {ILogMessageListener} listener listener you wish to stop receiving log message events
   */
  offLogMessage(listener: ILogMessageListener): void
}
