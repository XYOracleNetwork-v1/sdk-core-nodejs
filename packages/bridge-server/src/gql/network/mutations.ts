import { IContext, INetworkMutation, IConnectArgs } from '../../@types'
import withAuth from '../decorators/withAuth'

export const networkMutation = () => ({
  connect: withAuth(async (parent: any, args: IConnectArgs, { wifi }: IContext): Promise<boolean> => {
    const v = await wifi.connect(args)
    return true
  })
})
