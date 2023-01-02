/**
 * A resource that needs to be started, and stopped
 */
export interface IManagedResource {
  /**
   * Starts the managed resources, creating any timers, binding any sockets to be ready to serve connections
   * @returns {Promise<void>}
   */
  start(): Promise<void>
  /**
   * Stops the managed resource, cleaning up any allocated resources such as sockets, timers etc.
   * @returns {Promise<void>}
   */
  stop(): Promise<void>
}
