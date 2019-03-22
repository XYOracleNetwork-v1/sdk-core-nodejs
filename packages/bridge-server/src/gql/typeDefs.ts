import gql from 'graphql-tag'
import networkSchema from './network/schema'

const rootSchema = gql`
type Query {
  _empty: String
}

type Mutation {
  _empty: String
}
`

export default [
  rootSchema,
  networkSchema
]
