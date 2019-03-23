import { IConfigurationMutation, IContext, IIdArgs, IArchivist } from '../../@types'

export const configurationMutation = () => ({
  async setDefaultArchivist(parent: any, args: IIdArgs, ctx: IContext) {
    return args
  },

  async attachArchivist(parent: any, args: IArchivist, ctx: IContext) {
    return args
  },

  async detachArchivist(parent: any, args: IIdArgs, ctx: IContext) {
    return args
  }
})
