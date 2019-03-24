import { IContext, IIdArgs } from '../../@types'

export const configurationMutation = () => ({
  async setPaymentKey(parent: any, { paymentKey }: { paymentKey: string }, { configuration }: IContext) {
    return configuration.setPaymentKey(paymentKey)
  },

  async setDefaultArchivist(parent: any, { id }: IIdArgs, { configuration }: IContext) {
    return configuration.setDefaultArchivist(id)
  },

  async attachArchivist(parent: any, { dns, port }: { dns: string, port: number }, { configuration }: IContext) {
    return configuration.attachArchivist(dns, port)
  },

  async detachArchivist(parent: any, args: IIdArgs, { configuration }: IContext) {
    return configuration.detachArchivist(args.id)
  },

  async updatePin(parent: any, { oldPin, newPin }: { oldPin: string, newPin: string }, { configuration }: IContext) {
    return configuration.updatePin(oldPin, newPin)
  }
})
