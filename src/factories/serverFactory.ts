import { injectable } from 'inversify'
import { IServer } from '../interfaces/server'
import { IConfig, ServerTypeEnum } from '../models/config'
import { UDPServer } from '../services/udpServer'
import { TCPServer } from '../services/tcpServer'
import { Logger } from 'pino'

export interface IServerFactory {
  createServer(config: IConfig, logger: Logger): IServer
}

@injectable()
export class ServerFactory implements IServerFactory {
  createServer(config: IConfig, log: Logger): IServer {
    if (config.serverType === ServerTypeEnum.TCP) {
      log.info('Creating TCPServer')
      return new TCPServer(config, log)
    } else {
      log.info('Creating UDPServer')
      return new UDPServer(config, log)
    }
  }
}
