import { describe, it, expect } from '@jest/globals'
import 'reflect-metadata'
import { TYPES } from '../src/types'
import { appContainer } from '../src/inversify.config'
import { IConfig, ServerTypeEnum } from '../src/models/config'

describe('inversify.config', () => {
  it('binds config', () => {
    expect(appContainer.isBound(TYPES.Configurations.Main)).toBeTruthy()
    const config = appContainer.get<IConfig>(TYPES.Configurations.Main)
    expect(config).toBeDefined()
    expect(config.serverType).toEqual(ServerTypeEnum.TCP)
  })
  it('binds server service', () => {
    expect(appContainer.isBound(TYPES.Services.Server)).toBeTruthy()
  })
})
