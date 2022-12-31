import 'reflect-metadata'
import { describe, it, expect } from '@jest/globals'
import { HealthMonitor } from '../../src/services/healthMonitor'
import Pino from 'pino'
import axios from 'axios'

describe('HealthMonitor', () => {
  it('should start', async () => {
    const pino = Pino()
    const server = new HealthMonitor(pino)
    await server.start()
    const res = await axios.get('http://127.0.0.1:8080/health')
    expect(res.statusText).toEqual('OK')
    await server.stop()
  })
})
