/**
 * Create a managed connection pool where connections can be acquired/leased from the pool
 * and released when finished for re-use.
 */
export interface IConnPool<T> {
  /**
   * Acquire a connection from the pool, if one is available it's re-used, if one is not available it will
   * be allocated
   * @returns {Promise<T>} promise that resolves with the connection from the pool
   */
  connect(): Promise<T>
  /**
   *
   * @param {T} conn connection to release back to the connection pool
   * @returns {Promise<void>} promise that resolves once the connection has been returned to the pool
   */
  release(conn: T): Promise<void>
  /**
   * @returns {number} number of connections in pool
   */
  count(): number
}
