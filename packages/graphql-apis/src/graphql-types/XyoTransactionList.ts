/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Tuesday, 19th February 2019 10:58:30 am
 * @Email:  developer@xyfindables.com
 * @Filename: XyoTransactionList.ts
 
 * @Last modified time: Tuesday, 19th February 2019 10:58:56 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export const type = `
type XyoTransactionList implements List {
  meta: ListMeta!
  items: [XyoTransaction!]!
}
`

export const dependsOnTypes = [`List`, `ListMeta`, `XyoTransaction`]
