export interface IArchivist {
  id?: string
  dns?: string
  port?: number
}

export interface IBridgeConfigurationManager {
  getPublicKey(): Promise<string>
  getPaymentKey(): Promise<string>
  setPaymentKey(paymentKey: string): Promise<string>
  setDefaultArchivist(id: string): Promise<IArchivist>
  getDefaultArchivist(): Promise<IArchivist>
  getAttachedArchivists(): Promise<IArchivist[]>
  attachArchivist(dns: string, port: number): Promise<IArchivist>
  detachArchivist(id: string): Promise<IArchivist>
  verifyPin(pin: string): Promise<boolean>
  updatePin(oldPin: string, newPin: string): Promise<boolean>
}
