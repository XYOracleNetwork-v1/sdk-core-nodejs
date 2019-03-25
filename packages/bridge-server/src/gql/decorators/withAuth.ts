import { IContext } from '../../@types'

export default (
  fn: (parent: any, args: any, ctx: IContext, info: any) => any
) => async (parent: any, args: any, ctx: IContext, info: any) => {
  if (ctx.authError) throw new Error(ctx.authError)
  const configured = await ctx.configuration.isConfigured()
  if (configured && !ctx.authenticated) throw new Error('Invalid')
  return fn(parent, args, ctx, info)
}
