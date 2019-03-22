import { IContext, INetworkMutation, IConnectArgs } from '../../@types'

export class NetworkMutation implements INetworkMutation {
  public async connect (parent: any, args: IConnectArgs, { wifi }: IContext): Promise<boolean> {
    const v = await wifi.connect({ ssid: args.ssid, password: args.password })
    return true
  }
}
