import { inject, injectable, postConstruct, preDestroy } from 'inversify'
import { TYPES } from '../types'
import { Logger } from 'pino'
import { createServer } from '@promster/server'
import { IncomingMessage, Server, ServerResponse } from 'http'
import merge from 'merge-options'

import type { TDefaultedPromsterOptions } from '@promster/types'
import {
  createGcMetrics,
  createRequestRecorder,
  createGcObserver,
  defaultNormalizers,
} from '@promster/metrics'

@injectable()
export class MetricServer {
  private readonly log: Logger
  private server?: Server<typeof IncomingMessage, typeof ServerResponse>

  constructor(@inject(TYPES.Logger) logger: Logger) {
    this.log = logger
    const allDefaultedOptions: TDefaultedPromsterOptions = merge(
      createGcMetrics.defaultOptions,
      createRequestRecorder.defaultOptions,
      createGcObserver.defaultOptions,
      defaultNormalizers
    )
    createGcMetrics(allDefaultedOptions)
    createGcObserver(allDefaultedOptions)
  }

  @postConstruct()
  public async start(): Promise<void> {
    this.log.info('Starting metrics server')
    this.server = await createServer({
      port: 9091,
      hostname: '0.0.0.0',
    })
    this.log.info('Finished starting metrics server')
  }

  @preDestroy()
  public async close(): Promise<void> {
    this.log.info('Closing metrics server')
    await this.server?.close()
    this.log.info('Finished closing metrics server')
  }
}
