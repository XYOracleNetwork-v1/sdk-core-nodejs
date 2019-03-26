import { PrimaryService } from 'bleno'
import { WriteJSONCharacteristic } from '../../characteristics/write'
import { ReadStringCharacteristic } from '../../characteristics/read'
import { NotifyStringCharacteristic } from '../../characteristics/notify'
import { NETWORK_SERVICE_UUID, WRITE_CONNECT_UUID, NOTIFY_SSID_UUID, NOTIFY_IP_UUID, NOTIFY_STATUS_UUID, READ_SCAN_UUID } from './uuids'
import { IWifiManager, IConnect, IStatus } from '@xyo-network/wifi-manager'
import { identity, over, uniq, map, get } from 'lodash'
import debug, { Debugger } from 'debug'

enum NetworkStatus {
  offline = '0',
  connecting = '1',
  connected = '2'
}

export default class NetworkService extends PrimaryService {
  public wifiManager: IWifiManager
  public writeConnect: WriteJSONCharacteristic<IConnect>
  public notifyStatus: NotifyStringCharacteristic
  public notifySSID: NotifyStringCharacteristic
  public notifyIP: NotifyStringCharacteristic
  public readScan: ReadStringCharacteristic
  public validatePin: (pin: string) => Promise<boolean>
  private unsubscribe: () => void
  private logger: Debugger
  constructor (wifiManager: IWifiManager, validatePin: (pin: string) => Promise<boolean>) {
    const writeConnect = new WriteJSONCharacteristic<IConnect>('connect', WRITE_CONNECT_UUID)
    const notifyStatus = new NotifyStringCharacteristic('status', NOTIFY_STATUS_UUID)
    const notifySSID = new NotifyStringCharacteristic('ssid', NOTIFY_SSID_UUID)
    const notifyIP = new NotifyStringCharacteristic('ip', NOTIFY_IP_UUID)
    const readScan = new ReadStringCharacteristic('scan', READ_SCAN_UUID)
    super({
      uuid: NETWORK_SERVICE_UUID,
      characteristics: [
        writeConnect.characteristic,
        notifyStatus.characteristic,
        notifySSID.characteristic,
        notifyIP.characteristic,
        readScan.characteristic
      ]
    })
    this.wifiManager = wifiManager
    this.writeConnect = writeConnect
    this.notifyStatus = notifyStatus
    this.notifySSID = notifySSID
    this.notifyIP = notifyIP
    this.readScan = readScan
    this.readScan.awaitCurrentValue = this.awaitScan.bind(this)
    this.validatePin = validatePin
    this.logger = debug('bleno:network')
    this.unsubscribe = () => null
  }

  public async awaitScan () {
    const networks = await this.wifiManager.scan()
    const ssidList = uniq(map(networks, network => get(network, 'ssid')).filter(identity))
    return ssidList.join(',')
  }

  public start () {
    const unsubscribeFromStatus = this.wifiManager.subscribe(status => this.updateStatus(status))
    const unsubscribeFromConnect = this.writeConnect.subscribe(arg => this.connect(arg))
    this.unsubscribe = over(unsubscribeFromStatus, unsubscribeFromConnect)
    this.logger('Network Service Started')
  }

  public stop () {
    this.unsubscribe()
    this.logger('Network Service Stopped')
  }

  private updateStatus ({ ssid, ip }: IStatus) {
    const status = ip ? NetworkStatus.connected : ssid ? NetworkStatus.connecting : NetworkStatus.offline
    this.logger('Network Service Updated', `status=${status}`, `ssid=${ssid}`, `ip=${ip}`)
    this.notifyStatus.setCurrentValue(status)
    this.notifySSID.setCurrentValue(ssid)
    this.notifyIP.setCurrentValue(ip)
  }

  private async connect ({ ssid, password }: IConnect) {
    try {
      this.updateStatus({ ssid, ip: '' })
      await this.wifiManager.connect({ ssid, password })
      const status = await this.wifiManager.getStatus()
      this.updateStatus(status)
    } catch (err) {
      this.logger(err.message)
    }
  }
}
