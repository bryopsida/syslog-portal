import { IManagedResource } from '../interfaces/managed'
import { IWatchDog } from '../interfaces/watchDog'

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

  /**
   * @inheritdoc
   */
  start(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  /**
   * @inheritdoc
   */
  stop(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  /**
   *
   * @inheritdoc
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
   * @inheritdoc
   */
  unregister(entityId: string): void {
    this._entities.delete(entityId)
    this._expectedCheckInIntervals.delete(entityId)
    this._entityCheckIn.delete(entityId)
  }

  /**
   * @inheritdoc
   */
  kick(entityId: string): void {
    this._entityCheckIn.set(entityId, Date.now())
  }
}
