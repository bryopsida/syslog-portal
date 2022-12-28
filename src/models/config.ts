export enum ServerTypeEnum {
  // eslint-disable-next-line no-unused-vars
  UDP,
  // eslint-disable-next-line no-unused-vars
  TCP,
}
export interface IConfig {
  serverType: ServerTypeEnum
  serverPort: number
}
