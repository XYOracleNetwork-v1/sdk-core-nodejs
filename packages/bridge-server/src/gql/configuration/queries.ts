import { IContext } from '../../@types'

export const configurationQuery = () => ({
  async publicKey(parent: any, args: any, { configuration }: IContext) {
    return configuration.getPublicKey()
  },

  async paymentKey(parent: any, args: any, { configuration }: IContext) {
    return configuration.getPaymentKey()
  },

  async defaultArchivist(parent: any, args: any, { configuration }: IContext) {
    return configuration.getDefaultArchivist()
  },

  async archivists (parent: any, args: any, { configuration }: IContext) {
    return configuration.getAttachedArchivists()
  }
})
