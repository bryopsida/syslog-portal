import { IServer } from '../interfaces/server'

export class UDPServer implements IServer {
  startListening(): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
