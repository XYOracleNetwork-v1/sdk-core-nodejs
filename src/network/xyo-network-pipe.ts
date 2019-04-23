
export interface IXyoNetworkPipe {
  getInitiationData (): Buffer | undefined
  send (data: Buffer, waitForResponse: boolean): Promise<Buffer | undefined>
}
