import { IServer } from '../interfaces/server'

export class TCPServer implements IServer {
  startListening(): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
