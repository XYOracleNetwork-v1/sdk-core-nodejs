/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 15th October 2018 11:00:46 am
 * @Email:  developer@xyfindables.com
 * @Filename: network.d.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 15th October 2018 11:04:19 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

declare module 'network' {
  export function get_active_interface(cb: (error: Error | undefined, activeNetwork: IActiveNetwork) => void): void;

  export interface IActiveNetwork  {
    name: string;
    ip_address: string;
    mac_address: string;
    type: string;
    netmask: string;
    gateway_ip: string;
  }
}