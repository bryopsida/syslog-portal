export interface IConnPool<T> {
  connect(): Promise<T>
  release(conn: T): Promise<void>
}
