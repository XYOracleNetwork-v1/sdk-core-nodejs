import { IBridgeConfigurationManager, IArchivist } from './@types'

export class BridgeConfigurationManager implements IBridgeConfigurationManager {
  public async getPublicKey(): Promise<string> {
    // tslint:disable-next-line
    return '000c4114ab1adccbf3205ef2b524fe502fcdd2ee91ce3ea72898c6452cca510039e4ebfa3c7f133bfb415e1835337ecaed48195d576d5720c8cd729543a93e9e9b56ad'
  }

  public async getPaymentKey(): Promise<string> {
    // tslint:disable-next-line
    return '0x4aef1Fd68C9D0b17d85E0f4e90604F6c92883F18'
  }

  public async setPaymentKey(paymentKey: string): Promise<string> {
    return ''
  }

  public async setDefaultArchivist(id: string): Promise<IArchivist> {
    return {}
  }

  public async getDefaultArchivist(): Promise<IArchivist> {
    return {}
  }

  public async attachArchivist(dns: string, port: number): Promise<IArchivist> {
    return {}
  }

  public async detachArchivist(id: string): Promise<IArchivist> {
    return {}
  }

  public async getAttachedArchivists(): Promise<IArchivist[]> {
    return []
  }

  public async verifyPin(pin: string): Promise<boolean> {
    return pin === '0000'
  }

  public async updatePin(oldPin: string, newPin: string): Promise<boolean> {
    return true
  }
}
