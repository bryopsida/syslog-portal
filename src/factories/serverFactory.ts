import { injectable } from 'inversify'
import { IServer } from '../interfaces/server.js'
import { IConfig, ServerTypeEnum } from '../models/config.js'
import { UDPServer } from '../services/udpServer.js'
import { TCPServer } from '../services/tcpServer.js'
import { Logger } from 'pino'
import { IWatchDog } from '../interfaces/watchDog.js'

export interface IServerFactory {
  /**
   * Create a server matching the defined configuration
   * @param {IConfig} config server configuration
   * @param {Logger} logger server logger
   * @param {IWatchDog} watchDog server checks in with this watchdog
   */
  createServer(config: IConfig, logger: Logger, watchDog: IWatchDog): IServer
}

@injectable()
export class ServerFactory implements IServerFactory {
  /**
   * @inheritDoc
   */
  createServer(config: IConfig, log: Logger, watchDog: IWatchDog): IServer {
    if (config.serverType === ServerTypeEnum.TCP) {
      log.info('Creating TCPServer')
      return new TCPServer(config, log, watchDog)
    } else {
      log.info('Creating UDPServer')
      return new UDPServer(config, log, watchDog)
    }
  }
}
