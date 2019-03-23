import { IConfigurationQuery, IContext } from '../../@types'

export const configurationQuery = () => ({
  async publicKey(parent: any, args: any, ctx: IContext) {
    // tslint:disable-next-line
    return '000c4114ab1adccbf3205ef2b524fe502fcdd2ee91ce3ea72898c6452cca510039e4ebfa3c7f133bfb415e1835337ecaed48195d576d5720c8cd729543a93e9e9b56ad'
  },

  async paymentKey(parent: any, args: any, ctx: IContext) {
    // tslint:disable-next-line
    return '0x4aef1Fd68C9D0b17d85E0f4e90604F6c92883F18'
  },

  async defaultArchivist(parent: any, args: any, ctx: IContext) {
    return {
      dns: 'alpha-peers.xyo.network',
      port: 11001
    }
  },

  async archivists (parent: any, args: any, ctx: IContext) {
    return []
  }
})
