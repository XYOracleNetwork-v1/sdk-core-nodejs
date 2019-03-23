import { IContext } from '../../@types'
import { IStatus, getIp } from '@xyo-network/wifi-manager'

export const networkQuery = () => ({
  async ip(parent: any, args: any, ctx: IContext): Promise<string|null> {
    return getIp()
  },

  async port(parent: any, args: any, ctx: IContext): Promise<number> {
    return ctx.port
  },

  async url(parent: any, args: any, ctx: IContext): Promise<string|null> {
    const ip = getIp()
    if (!ip) return null
    return `http://${ip}:${ctx.port}`
  },

  async network(parent: any, args: any, { wifi }: IContext): Promise<IStatus|undefined> {
    return wifi.getStatus()
  },

  async scan(parent: any, args: any, { wifi }: IContext): Promise<IStatus[]> {
    return wifi.scan()
  }
})
