import { flatMap, first, get } from 'lodash'
import os from 'os'

const isValidIPv4 = (iface: any) => !get(iface, 'internal') && get(iface, 'family') === 'IPv4'

export default (): string|null => {
  const interfaces = os.networkInterfaces()
  const flatInterfaces = flatMap(Object.keys(interfaces).map(name => interfaces[name] || []))
  const ips = flatInterfaces.filter(isValidIPv4).map((iface: any) => get(iface, 'address'))
  return first(ips)
}
