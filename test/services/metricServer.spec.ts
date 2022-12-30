import 'reflect-metadata'
import { describe, it, expect } from '@jest/globals'
import { MetricServer } from '../../src/services/metricServer'
import Pino from 'pino'
import axios from 'axios'

describe('MetricServer', () => {
  it('should start', async () => {
    const pino = Pino()
    const server = new MetricServer(pino)
    await server.start()
    const res = await axios.get('http://127.0.0.1:9091/metrics')
    expect(res.data).toBeDefined()
    await server.close()
  })
})
