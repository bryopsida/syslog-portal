import { MongoClient } from 'mongodb'
import { IConnPool } from '../interfaces/connPool'
import { injectable } from 'inversify'

@injectable()
export class MongoConnPool implements IConnPool<MongoClient> {
  connect(): Promise<MongoClient> {
    throw new Error('Method not implemented.')
  }

  release(conn: MongoClient): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
