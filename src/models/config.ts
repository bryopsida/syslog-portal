import { MongoClientOptions } from 'mongodb'

export enum ServerTypeEnum {
  // eslint-disable-next-line no-unused-vars
  UDP = 'UDP',
  // eslint-disable-next-line no-unused-vars
  TCP = 'TCP',
}
export interface ISubComponentConfig {
  enabled: boolean
}
export enum ArchiverType {
  // eslint-disable-next-line no-unused-vars
  MONGO = 0,
  // eslint-disable-next-line no-unused-vars
  SQLLITE3 = 1,
}
export interface IArchiverconfig extends ISubComponentConfig {
  type: ArchiverType
  options?: MongoClientOptions
  hostname?: string
  port?: number
  username?: string
  password?: string
  usernameFile?: string
  passwordFile?: string
}
export interface IConfig {
  serverType: ServerTypeEnum
  serverPort: number
  archiver: IArchiverconfig
}
