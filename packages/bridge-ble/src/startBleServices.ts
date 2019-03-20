import { PrimaryService } from "bleno"
import debug from "debug"

const logger = debug("bleno")

export default (name: string, services: any[]) => {
  const bleno = require("bleno")
  bleno.on("stateChange", (state: string) => {
    if (state === "poweredOn") {
      logger("Starting broadcast...")
      bleno.startAdvertising(name, services.map(({ uuid }) => uuid))
    } else {
      logger("Stopping broadcast...")
      bleno.stopAdvertising()
    }
  })

  bleno.on("advertisingStart", (err: Error) => {
    if (err) return logger(err)
    bleno.setServices(services, (error: Error) => {
      if (error) return logger(error)
      logger("Services configured")
    })
  })
}
