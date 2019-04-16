/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Thursday, 14th February 2019 10:02:40 am
 * @Email:  developer@xyfindables.com
 * @Filename: XyoEntitiesList.ts
 
 * @Last modified time: Thursday, 14th February 2019 1:42:28 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export const type = `
type XyoEntitiesList implements List {
  meta: ListMeta!
  items: [XyoEntity!]!
}
`

export const dependsOnTypes = [`List`, `ListMeta`, `XyoEntity`]
