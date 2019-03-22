import { NetworkQuery } from './queries'
import { NetworkMutation } from './mutations'

export default () => ({
  Query: new NetworkQuery(),
  Mutation: new NetworkMutation()
})
