export enum ServerTypeEnum {
  // eslint-disable-next-line no-unused-vars
  UDP = 'UDP',
  // eslint-disable-next-line no-unused-vars
  TCP = 'TCP',
}
export interface IConfig {
  serverType: ServerTypeEnum
  serverPort: number
}
