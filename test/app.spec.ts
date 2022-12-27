import { describe, it, expect } from "@jest/globals"
import main from "../src/app"
import "reflect-metadata"
import { Container } from "inversify"

describe("app", () => {
  it("should echo a message back", async () => {
    const message = "123"
    const appContainer = require("../src/inversify.config")
      .appContainer as Container
    const result = await main(appContainer, message)
    expect(result).toEqual(message)
  })
})
