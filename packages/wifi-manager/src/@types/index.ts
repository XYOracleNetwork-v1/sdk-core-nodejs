export interface IConnect {
  ssid: string
  password: string
}

export interface IStatus {
  ssid: string
  ip: string
}

export interface IWifiManager {
  subscribe(fn: (d: IStatus) => void): () => void
  connect(args: IConnect): Promise<undefined>
  getStatus(): Promise<IStatus>
  scan(): Promise<IStatus[]>
}
