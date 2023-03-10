import { MongoClientOptions } from 'mongodb'

/**
 * Type of server, can be TCP or UDP
 */
export enum ServerTypeEnum {
  // eslint-disable-next-line no-unused-vars
  UDP = 'UDP',
  // eslint-disable-next-line no-unused-vars
  TCP = 'TCP',
}
/**
 * Sub component configuration
 */
export interface ISubComponentConfig {
  enabled: boolean
}
/**
 * Archiver type
 */
export enum ArchiverType {
  // eslint-disable-next-line no-unused-vars
  MONGO = 'MONGO',
  // eslint-disable-next-line no-unused-vars
  SQLLITE3 = 'SQLLITE3',
  // eslint-disable-next-line no-unused-vars
  POUCHDB = 'POUCHDB',
}
/**
 * Archiver configuration
 */
export interface IArchiverconfig extends ISubComponentConfig {
  /**
   * Type of archiver
   */
  type: ArchiverType
  /**
   * Pass through options
   */
  options?: MongoClientOptions
  /**
   * Hostname of system receiving messages for archival
   */
  hostname?: string
  /**
   * Listening port of system receiving message for archival
   */
  port?: number
  /**
   * username used for authentication to the archival system
   */
  username?: string
  /**
   * password used for authentication to the archival system
   */
  password?: string
  /**
   * Path to a file containing the username for authentication
   */
  usernameFile?: string
  /**
   * Path to a file containing the password for authentication
   */
  passwordFile?: string
  /**
   * Interval in milliseconds between syncs of local archival copy to a remote store
   */
  syncInterval?: number
  /**
   * Database folder
   */
  databaseFolder?: string
  /**
   * Protocol
   */
  proto?: string
  /**
   * List of property keys on a log message to use for partitiong keys in priority listing, fist present will be used
   */
  partitionKeyPriorityList?: string[]
}
/**
 * System configuration
 */
export interface IConfig {
  /**
   * Server type
   */
  serverType: ServerTypeEnum
  /**
   * Server listening port
   */
  serverPort: number
  /**
   * Archiver configuration
   */
  archiver: IArchiverconfig
}
