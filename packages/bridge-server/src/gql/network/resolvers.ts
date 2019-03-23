import { networkQuery } from './queries'
import { networkMutation } from './mutations'

export default () => ({
  Query: networkQuery(),
  Mutation: networkMutation()
})
