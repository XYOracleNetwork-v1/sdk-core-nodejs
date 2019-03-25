import { IWifiManager, IConnect, IStatus } from '../@types'
import { Subscribe } from '@xyo-network/utils'
import { getIp } from '../utils'
import { first } from 'lodash'
import debug from 'debug'

export default class PiWifiManager extends Subscribe<IStatus> implements IWifiManager {
  public statusInterval = 10000
  private logger = debug('wifi:pi')
  private wifi = (require('node-wifi') as any)
  private intervalId: any
  private updating = false
  constructor () {
    super()
    this.wifi.init({
      iface: null
    })
  }
  public async getStatus (): Promise<IStatus> {
    const connections = await this.wifi.getCurrentConnections()
    const { ssid } = first(connections) || { ssid: '' }
    const ip = getIp() || ''
    return {
      ssid,
      ip
    }
  }
  public async connect ({ ssid, password }: IConnect): Promise<undefined> {
    return this.wifi.connect({ ssid, password })
  }
  public async scan (): Promise<IStatus[]> {
    return this.wifi.scan()
  }
  public subscribe (fn: (d: IStatus) => void) {
    const unsubscribe = super.subscribe(fn)
    if (this.listenerCount() === 1) {
      this.startStatusListener()
    }
    return () => {
      unsubscribe()
      if (!this.hasSubscribers()) {
        this.stopStatusListener()
      }
    }
  }
  private startStatusListener () {
    this.stopStatusListener()
    this.intervalId = setInterval(this.updateStatus, this.statusInterval)
    this.updateStatus()
  }
  private stopStatusListener () {
    clearInterval(this.intervalId)
  }
  private updateStatus = async () => {
    if (this.updating) {
      this.logger('status update in progress')
      return
    }
    try {
      const status = await this.getStatus()
      this.setCurrentValue(status)
    } catch (e) {
      this.logger('status update error', e.message)
    }
  }
}
