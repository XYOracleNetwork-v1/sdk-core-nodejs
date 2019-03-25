import { IContext } from '../../@types'
import withAuth from '../decorators/withAuth'
import { sign } from '../../token'

export const configurationQuery = () => ({
  getAuthToken: async (parent: any, args: any, { configuration }: IContext) => {
    const valid = await configuration.verifyPin(args.pin)
    if (!valid) throw new Error('Invalid')
    return sign(args.pin)
  },

  publicKey: withAuth(async (parent: any, args: any, { configuration }: IContext) => {
    return configuration.getPublicKey()
  }),

  paymentKey: withAuth(async (parent: any, args: any, { configuration }: IContext) => {
    return configuration.getPaymentKey()
  }),

  defaultArchivist: withAuth(async (parent: any, args: any, { configuration }: IContext) => {
    return configuration.getDefaultArchivist()
  }),

  archivists: withAuth(async  (parent: any, args: any, { configuration }: IContext) => {
    return configuration.getAttachedArchivists()
  })
})
