import { IContext } from '../../@types'

export default (
  fn: (parent: any, args: any, ctx: IContext, info: any) => any
) => async (parent: any, args: any, ctx: IContext, info: any) => {
  if (ctx.authError) throw new Error(ctx.authError)
  if (!ctx.pin) throw new Error('Invalid')
  return fn(parent, args, ctx, info)
}
