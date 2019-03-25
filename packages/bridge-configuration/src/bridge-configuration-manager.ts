import { IBridgeConfigurationManager, IArchivist } from './@types'

// tslint:disable-next-line
let mockPassword = ''
// tslint:disable-next-line
let mockPublicKey = '000c4114ab1adccbf3205ef2b524fe502fcdd2ee91ce3ea72898c6452cca510039e4ebfa3c7f133bfb415e1835337ecaed48195d576d5720c8cd729543a93e9e9b56ad'
// tslint:disable-next-line
let mockPaymentKey = '0x4aef1Fd68C9D0b17d85E0f4e90604F6c92883F18'
let mockArchivists: IArchivist[] = []

export class BridgeConfigurationManager implements IBridgeConfigurationManager {
  public async getPublicKey(): Promise<string> {
    return mockPublicKey
  }

  public async getPaymentKey(): Promise<string> {
    // tslint:disable-next-line
    return mockPaymentKey
  }

  public async setPaymentKey(paymentKey: string): Promise<string> {
    mockPaymentKey = paymentKey
    return paymentKey
  }

  public async setDefaultArchivist(id: string): Promise<IArchivist> {
    return {
      id
    }
  }

  public async getDefaultArchivist(): Promise<IArchivist> {
    return {}
  }

  public async attachArchivist(dns: string, port: number): Promise<IArchivist> {
    const id = `http://${dns}:${port}`
    const archivist = {
      id,
      dns,
      port
    }
    mockArchivists.push(archivist)
    return archivist
  }

  public async detachArchivist(id: string): Promise<IArchivist> {
    mockArchivists = mockArchivists.filter(archivist => archivist.id !== id)
    return {
      id
    }
  }

  public async getAttachedArchivists(): Promise<IArchivist[]> {
    return mockArchivists
  }

  public async verifyPin(pin: string): Promise<boolean> {
    return pin === mockPassword
  }

  public async updatePin(oldPin: string, newPin: string): Promise<string> {
    if (mockPassword && oldPin !== mockPassword) throw new Error('Invalid')
    mockPassword = newPin
    return newPin
  }

  public async isConfigured(): Promise<boolean> {
    return !!mockPassword
  }
}
