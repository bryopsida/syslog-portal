import EventEmitter from 'events'
import { FACILITY, SEVERITY } from '../models/rfc5424'

/**
 * Log message shape
 */
export interface ILogMessage {
  /**
   * Time message was recorded on originating server
   */
  timestamp?: Date
  /**
   * Severity of the log message
   */
  severity: SEVERITY
  /**
   * Which system facility produced the log message
   */
  facility: FACILITY
  /**
   * The log message itself
   */
  message: string
  /**
   * Name of the app producing the message
   */
  app?: string
  /**
   * Process id of the app message
   */
  procId?: number
  /**
   * Unique message id of the message
   */
  msgId?: string
  /**
   * hostname of the server that produced the log message
   */
  hostname?: string
  /**
   * Version of this model
   */
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
/**
 * A server for receiving syslog messages
 */
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
