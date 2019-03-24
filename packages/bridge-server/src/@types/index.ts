import { Express } from 'express'
import { IWifiManager, IStatus } from '@xyo-network/wifi-manager'
import { IBridgeConfigurationManager, IArchivist } from '@xyo-network/bridge-configuration'

export interface IContext {
  wifi: IWifiManager
  configuration: IBridgeConfigurationManager
  port: number
  pin: string
}

export type IExpressApplyRoutes = (app: Express) => void

export interface IIdArgs {
  id: string
}

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

export interface IConfigurationQuery {
  publicKey(parent: any, args: any, ctx: IContext): Promise<string|null>
  defaultArchivist(parent: any, args: any, ctx: IContext): Promise<IArchivist|null>
  archivists(parent: any, args: any, ctx: IContext): Promise<IArchivist[]>
}

export interface IConfigurationMutation {
  setDefaultArchivist(parent: any, args: any, ctx: IContext): Promise<IArchivist|null>
  attachArchivist(parent: any, args: any, ctx: IContext): Promise<IArchivist|null>
  detachArchivist(parent: any, args: any, ctx: IContext): Promise<IArchivist|null>
}
