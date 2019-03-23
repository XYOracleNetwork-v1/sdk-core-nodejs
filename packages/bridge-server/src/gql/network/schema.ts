import gql from 'graphql-tag'

export default gql`
  type Status {
    ssid: String
    ip: String
  }

  extend type Query {
    ip: String
    port: Int
    url: String
    network: Status
    scan: [Status]
  }

  extend type Mutation {
    connect(
      ssid: String
      password: String
      pin: String
    ): Boolean
  }
`
