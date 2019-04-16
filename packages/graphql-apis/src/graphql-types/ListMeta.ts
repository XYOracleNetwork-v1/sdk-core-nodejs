/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Thursday, 14th February 2019 9:59:39 am
 * @Email:  developer@xyfindables.com
 * @Filename: ListMeta.ts
 
 * @Last modified time: Thursday, 14th February 2019 1:42:13 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export const type = `
type ListMeta {
  totalCount: Int!,
  endCursor: String,
  hasNextPage: Boolean!
}
`

export const dependsOnTypes = []
