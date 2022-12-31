export interface IWatchDog {
  /**
   * Register an entity with the watchdog
   * @param {string} entityId unique identifier in the system for the entity
   * @param {string} humanReadableName a string identifying or descrbing the entity for display on interfaces
   * @param {string} expectedCheckInInterval the interval at which the entity is expected to check in (kick) the watchdog
   * @returns {void}
   */
  register(
    entityId: string,
    humanReadableName: string,
    expectedCheckInInterval: number
  ): void
  /**
   * Unregister an entity from the watchdog, this cleans up any timers and resources allocated for watching an entity
   * @param {string} entityId unique identifier in the system for the entity, needs to match the entityId passed when registering
   * @returns {void}
   */
  unregister(entityId: string): void
  /**
   * Check in with the watchdog
   * @param {string} entityId the unique entity id, needs to match the id used when registering the entity
   * @returns {void}
   */
  kick(entityId: string): void
}
