import { EventEmitter } from 'stream'
import { ILogMessage, ILogMessageListener, IServer } from '../interfaces/server'
import { IConfig } from '../models/config'
import { Logger } from 'pino'
import { FACILITY, PRI, SEVERITY } from '../models/rfc5424'
import { IWatchDog } from '../interfaces/watchDog'

const NIL = '-'

/**
 * Base class for shared functionality between TCP and UDP Server
 */
export abstract class BaseServer extends EventEmitter implements IServer {
  protected readonly _port: number
  protected readonly _log: Logger
  protected readonly _listeners = new Set<ILogMessageListener>()
  protected readonly _healthMonitor: IWatchDog
  protected _entityId?: string

  constructor(config: IConfig, logger: Logger, watchDog: IWatchDog) {
    super()
    this._port = config.serverPort
    this._log = logger
    this._healthMonitor = watchDog
  }

  abstract startListening(): Promise<void>
  abstract close(): Promise<void>

  protected parseMessage(data: Buffer, remoteInfo: any): void {
    try {
      // Supports RFC 3164 and RFC 5424
      // data is ASCII
      const textData = data.toString('ascii')
      const parserState = {
        position: 0,
      }
      const pri = this.extractPri(textData, parserState)
      this._log.trace('Facility: %s, Severity: %s', pri.facility, pri.severity)
      const version = this.extractVersion(textData, parserState)
      this._log.trace('Version: %s', version)
      const timestamp = this.extractTimestamp(textData, parserState)
      this._log.trace('Timestamp: %s', timestamp)
      const hostname = this.extractToken(textData, parserState)
      this._log.trace('Hostname: %s', hostname)
      const app = this.extractToken(textData, parserState)
      this._log.trace('App: %s', app)
      const procId = this.extractToken(textData, parserState)
      this._log.trace('ProcID: %d', procId)
      const msgId = this.extractToken(textData, parserState)
      this._log.trace('MsgID: %s', msgId)
      // this is not correct, this needs to handle structured data, for now we will hope it's the nil value -
      const sd = this.extractToken(textData, parserState)
      this._log.trace('SD: %s', sd)
      // the remainder is the msg, the msg can be UTF8 and can have a UTF8 BOM
      const msg = textData.slice(parserState.position).trim()
      this._log.trace('Msg: %s', msg)
      const msgDto: ILogMessage = {
        facility: pri.facility,
        severity: pri.severity,
        procId: procId !== NIL ? parseInt(procId) : undefined,
        msgId: msgId !== NIL ? msgId : undefined,
        app: app !== NIL ? app : undefined,
        message: msg,
        timestamp,
        hostname,
        modelVersion: 1,
      }
      this.emitLogMessage(msgDto).catch((err) => {
        this._log.warn(
          `Error occurred during event handler chain for log messages: ${err}`
        )
      })
    } catch (err: any) {
      this._log.error(`Encountered error while parsing message: ${err.message}`)
    }
  }

  protected extractToken(data: string, parserState: any): string {
    const str = data.slice(parserState.position).trimStart()
    const endPos = str.indexOf(' ')
    if (endPos === -1) throw new Error('Unable to tokenize value')
    const token = str.slice(0, endPos)
    parserState.position += endPos + 1
    return token.trim()
  }

  protected extractTimestamp(data: string, parserState: any): Date {
    const token = this.extractToken(data, parserState)
    const ts = Date.parse(token)
    if (isNaN(ts)) throw new Error(`Failed to parse date from ${token}`)
    return new Date(ts)
  }

  protected extractVersion(data: string, parserState: any): string {
    const version = data.slice(parserState.position, parserState.position + 1)
    parserState.position++
    return version
  }

  protected extractPri(data: string, parserState: any): PRI {
    // does it start with <, if not bail
    if (data[0] !== '<') {
      throw new Error(
        `Incoming message did not start with <, instead received ${data[0]}`
      )
    }
    // get a shallow copy of just the first 5 characters
    const possiblePri = data.slice(0, 5)
    const closingChar = possiblePri.indexOf('>')
    if (closingChar === -1) {
      throw new Error('Missing closing > in PRI, invalid header!')
    }

    // we have a PRI snippet, now to to extract
    // from the RFC
    //
    //  The Priority value is calculated by first multiplying the Facility
    //  number by 8 and then adding the numerical value of the Severity.  For
    //  example, a kernel message (Facility=0) with a Severity of Emergency
    //  (Severity=0) would have a Priority value of 0.  Also, a "local use 4"
    //  message (Facility=20) with a Severity of Notice (Severity=5) would
    //  have a Priority value of 165.  In the PRI of a syslog message, these
    //  values would be placed between the angle brackets as <0> and <165>
    //  respectively.  The only time a value of "0" follows the "<" is for
    //  the Priority value of "0".  Otherwise, leading "0"s MUST NOT be used.

    const PRI = possiblePri.slice(1, closingChar)
    const PRINumber = parseInt(PRI)
    if (isNaN(PRINumber))
      throw new Error(`PRI is not a parsable number: ${PRI}`)

    // severity max value is 7, this is less than the multiplication factor
    // applied to the facility, meaning the severity value will always be fractional
    // when dividing the PRI
    //
    // we can divide the PRI by 8 and truncate to get the facility
    const facility = Math.trunc(PRINumber / 8)

    // if we have the facility the severity is simply the remainder of dividing the PRI by the facility
    const severity = PRINumber % facility
    parserState.position = closingChar + 1
    return {
      facility: facility as FACILITY,
      severity: severity as SEVERITY,
    }
  }

  protected async emitLogMessage(message: ILogMessage): Promise<void> {
    this._log.debug(
      'Emitting log message event to (%s) listeners',
      this._listeners.size
    )
    for (const listener of this._listeners.values()) {
      this._log.trace('Emitting log message to listener')
      await listener.onLogMessage(message)
      this._log.trace('Finished emitting log message to listener')
    }
    this._log.debug('Finished Emitting log message event')
  }

  public onLogMessage(listener: ILogMessageListener): void {
    this._log.info('Adding log message listener')
    this._listeners.add(listener)
    this._log.info('Listeners: %s', this._listeners.size)
  }

  public offLogMessage(listener: ILogMessageListener): void {
    this._log.info('Removing log message listener')
    this._listeners.delete(listener)
    this._log.info('Listeners: %s', this._listeners.size)
  }

  protected pingMonitor(): void {
    this._healthMonitor.kick(this._entityId as string)
  }
}
