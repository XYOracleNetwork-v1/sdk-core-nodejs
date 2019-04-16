/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Thursday, 14th February 2019 9:57:55 am
 * @Email:  developer@xyfindables.com
 * @Filename: XyoAboutMe.ts
 
 * @Last modified time: Thursday, 14th February 2019 1:45:05 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export const type = `
type XyoAboutMe {
  name: String,
  version: String,
  ip: String,
  graphqlPort: Int,
  boundWitnessServerPort: Int,
  address: String,
  peers: [String!]
}
`

export const dependsOnTypes = []
