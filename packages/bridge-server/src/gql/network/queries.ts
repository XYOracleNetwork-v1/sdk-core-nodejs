import { IContext, INetworkQuery } from '../../@types'
import { IStatus, getIp } from '@xyo-network/wifi-manager'
import { first } from 'lodash'

export class NetworkQuery implements INetworkQuery {
  public async ip(parent: any, args: any, ctx: IContext): Promise<string|null> {
    return getIp()
  }

  public async port(parent: any, args: any, ctx: IContext): Promise<number> {
    return ctx.port
  }

  public async url(parent: any, args: any, ctx: IContext): Promise<string|null> {
    const ip = getIp()
    if (!ip) return null
    return `http://${ip}:${ctx.port}`
  }

  public async network(parent: any, args: any, { wifi }: IContext): Promise<IStatus|undefined> {
    return wifi.getStatus()
  }

  public async scan(parent: any, args: any, { wifi }: IContext): Promise<IStatus[]> {
    return wifi.scan()
  }
}
