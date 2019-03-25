
import { IXyoNetworkAddressProvider, IXyoTCPNetworkAddress } from '@xyo-network/network.tcp'

export class XyoBridgeArchivistQueue {
  public activeArchivists: IXyoTCPNetworkAddress[] = []

  public tcpPeerSelector: IXyoNetworkAddressProvider = {
    next: async () => {
      return this.activeArchivists[Math.floor(Math.random() * this.activeArchivists.length)]
    }
  }
}
