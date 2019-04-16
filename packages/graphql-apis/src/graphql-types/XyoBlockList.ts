/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Thursday, 14th February 2019 10:00:26 am
 * @Email:  developer@xyfindables.com
 * @Filename: XyoBlockList.ts
 
 * @Last modified time: Thursday, 14th February 2019 1:42:25 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export const type = `
type XyoBlockList implements List {
  meta: ListMeta!
  items: [XyoBlock!]!
}
`

export const dependsOnTypes = [`List`, `ListMeta`, `XyoBlock`]
