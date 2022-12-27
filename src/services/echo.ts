import { inject, injectable } from "inversify"
import { TYPES } from "../types"
import { IEchoConfig } from "../models/echoConfig"

export interface IEcho {
  /**
   * Get a message echo'd back as the result of a promise
   */
  echo(message: string): Promise<string>
}

@injectable()
export class Echo implements IEcho {
  private readonly _config: IEchoConfig

  constructor(@inject(TYPES.Configurations.Echo) config: IEchoConfig) {
    this._config = config
  }

  echo(message: string): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(message)
      }, this._config.delay)
    })
  }
}
