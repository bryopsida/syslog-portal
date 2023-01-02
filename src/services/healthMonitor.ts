import { inject, injectable, postConstruct, preDestroy } from 'inversify'
import { IManagedResource } from '../interfaces/managed'
import { IWatchDog } from '../interfaces/watchDog'
import {
  IncomingMessage,
  Server,
  ServerResponse,
  createServer,
} from 'node:http'
import { Logger } from 'pino'
import { TYPES } from '../types'

@injectable()
export class HealthMonitor implements IWatchDog, IManagedResource {
  private readonly _entities: Map<string, string> = new Map<string, string>()
  private readonly _expectedCheckInIntervals: Map<string, number> = new Map<
    string,
    number
  >()

  private readonly _entityCheckIn: Map<string, number> = new Map<
    string,
    number
  >()

  private readonly _log: Logger

  private _server?: Server

  constructor(@inject(TYPES.Logger) log: Logger) {
    this._log = log
  }

  /**
   * @inheritDoc
   */
  @postConstruct()
  start(): Promise<void> {
    this._log.info('Starting health ep server')
    this._server = createServer(this.requestHandler)
    this._server.listen(8080, '0.0.0.0')
    this._log.info('Finished starting health ep server')
    return Promise.resolve()
  }

  requestHandler(req: IncomingMessage, resp: ServerResponse): void {
    // for now just respond with 200 once we are up, we can enhance this later if needed
    // main goal is just having something we can check to confirm liveness that isn't a syslog udp port
    resp.writeHead(200)
    resp.end()
  }

  /**
   * @inheritDoc
   */
  @preDestroy()
  async stop(): Promise<void> {
    this._log.info('Closing health ep server')
    if (this._server != null) {
      await new Promise((resolve, reject) => {
        this._server?.close((err) => {
          if (err) reject(err)
          resolve(null)
        })
      })
    }
    this._log.info('Finished closing health ep server')
  }

  /**
   *
   * @inheritDoc
   */
  register(
    entityId: string,
    humanReadableName: string,
    expectedCheckInInterval: number
  ): void {
    this._entities.set(entityId, humanReadableName)
    this._expectedCheckInIntervals.set(entityId, expectedCheckInInterval)
  }

  /**
   * @inheritDoc
   */
  unregister(entityId: string): void {
    this._entities.delete(entityId)
    this._expectedCheckInIntervals.delete(entityId)
    this._entityCheckIn.delete(entityId)
  }

  /**
   * @inheritDoc
   */
  kick(entityId: string): void {
    this._entityCheckIn.set(entityId, Date.now())
  }
}
