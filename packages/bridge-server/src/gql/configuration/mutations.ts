import { IContext, IIdArgs } from '../../@types'
import withAuth from '../decorators/withAuth'

export const configurationMutation = () => ({
  setPaymentKey: withAuth(async (parent: any, { paymentKey }: { paymentKey: string }, { configuration }: IContext) => {
    return configuration.setPaymentKey(paymentKey)
  }),

  setDefaultArchivist: withAuth(async (parent: any, { id }: IIdArgs, { configuration }: IContext) => {
    return configuration.setDefaultArchivist(id)
  }),

  attachArchivist: withAuth(async (
    parent: any,
    { dns, port }: { dns: string, port: number },
    { configuration }: IContext
  ) => {
    return configuration.attachArchivist(dns, port)
  }),

  detachArchivist: withAuth(async (parent: any, args: IIdArgs, { configuration }: IContext) => {
    return configuration.detachArchivist(args.id)
  }),

  updatePin: withAuth(async (
    parent: any,
    { oldPin, newPin }: { oldPin: string, newPin: string },
    { configuration }: IContext
  ) => {
    return configuration.updatePin(oldPin, newPin)
  })
})
