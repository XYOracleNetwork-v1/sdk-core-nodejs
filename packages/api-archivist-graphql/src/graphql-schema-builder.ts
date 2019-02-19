import { XyoBase } from '@xyo-network/base'

export class GraphqlSchemaBuilder extends XyoBase {

  public async buildSchema() {
    const compiledSchema = `
      scalar JSON

      type Query {
        blocksByPublicKey(publicKeys: [String!]): [XyoBlockCollection],
        blockList(limit: Int!, cursor: String): XyoBlockList!,
        about: XyoAboutMe,
        blockByHash(hash: String!): XyoBlock,
        entities(limit: Int!, cursor: String): XyoEntitiesList!
        intersections(publicKeyA: String!, publicKeyB: String!, limit: Int!, cursor: String): XyoIntersectionList!
      }

      type XyoIntersectionList implements List {
        meta: ListMeta!
        items: [String!]!
      }

      type XyoBlock {
        humanReadable: JSON!
        bytes: String!
        publicKeys: [XyoKeySet!]
        signatures: [XyoSignatureSet!]
        heuristics: [XyoHeuristicSet!]
        signedHash: String!
      }

      type XyoKeySet {
        array: [XyoPublicKey!]
      }

      type XyoObject {
        value: String!
      }

      type XyoSignatureSet {
        array: [XyoSignature!]
      }

      type XyoSignature {
        value: String!
      }

      type XyoPublicKey {
        value: String!
      }

      type XyoHeuristicSet {
        array: [XyoObject!]
      }

      type XyoBlockCollection {
        publicKey: String!
        blocks: [XyoBlock!]!
        publicKeySet: [String!]!
      }

      type XyoAboutMe {
        name: String,
        version: String,
        ip: String,
        graphqlPort: Int,
        nodePort: Int,
        address: String,
        peers: [XyoAboutMe]
      }

      interface List {
        meta: ListMeta!
      }

      type ListMeta {
        totalCount: Int!,
        endCursor: String,
        hasNextPage: Boolean!
      }

      type XyoBlockList implements List {
        meta: ListMeta!
        items: [XyoBlock!]!
      }

      type XyoEntityType {
        sentinel: Boolean!,
        bridge: Boolean!,
        archivist: Boolean!,
        diviner: Boolean!
      }

      type XyoEntity {
        firstKnownPublicKey: String!
        allPublicKeys: [String!]!
        type: XyoEntityType!
        mostRecentIndex: Int!
      }

      type XyoEntitiesList implements List {
        meta: ListMeta!
        items: [XyoEntity!]!
      }
    `

    return compiledSchema
  }
}
