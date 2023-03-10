import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import 'reflect-metadata'
import { IServer } from '../src/interfaces/server'
import { Container } from 'inversify'
import { TYPES } from '../src/types'
import { LoggerFactory } from '../src/logger/logger'
import { Logger } from 'pino'
import { MetricServer } from '../src/services/metricServer'
import { ArchiverType, IConfig } from '../src/models/config'

export interface IMain {
  (container: Container): Promise<void>
}

describe('app', () => {
  let container: Container
  let mockedServer: jest.Mocked<IServer>
  let main: IMain
  beforeEach(async () => {
    container = new Container()
    mockedServer = jest.mocked<IServer>({
      startListening: () => {
        return Promise.resolve()
      },
    } as any)
    container.bind<IServer>(TYPES.Services.Server).toConstantValue(mockedServer)
    container.bind<IConfig>(TYPES.Configurations.Main).toConstantValue({
      archiver: {
        enabled: false,
        type: ArchiverType.MONGO,
      },
    } as any)
    container
      .bind<MetricServer>(TYPES.Services.MetricServer)
      .toConstantValue({} as any)
    container
      .bind<Logger>(TYPES.Logger)
      .toConstantValue(new LoggerFactory({}).createLogger())
    main = await (await import('../src/app')).default
  })
  it('should start listening for connections', async () => {
    jest.spyOn(mockedServer, 'startListening').mockImplementation(() => {
      return Promise.resolve()
    })
    await main(container)
    expect(mockedServer.startListening).toHaveBeenCalled()
  })
})
