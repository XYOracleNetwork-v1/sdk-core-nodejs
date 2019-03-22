import { Express } from 'express'
import { IWifiManager, IStatus } from '@xyo-network/wifi-manager'

export interface IContext {
  port: number
  wifi: IWifiManager
}

export type IExpressApplyRoutes = (app: Express) => void

export interface IConnectArgs {
  ssid: string
  password: string
  pin: string
}

export interface INetworkQuery {
  ip(parent: any, args: any, ctx: IContext): Promise<string|null>
  port(parent: any, args: any, ctx: IContext): Promise<number>
  url(parent: any, args: any, ctx: IContext): Promise<string|null>
  network(parent: any, args: any, ctx: IContext): Promise<IStatus|undefined>
  scan(parent: any, args: any, ctx: IContext): Promise<IStatus[]>
}

export interface INetworkMutation {
  connect(parent: any, args: IConnectArgs, ctx: IContext): Promise<boolean>
}
