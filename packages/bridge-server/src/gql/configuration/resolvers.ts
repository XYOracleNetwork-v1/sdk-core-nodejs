import { IArchivist } from '@xyo-network/bridge-configuration'
import { configurationQuery } from './queries'
import { configurationMutation } from './mutations'
import { get } from 'lodash'

export default () => ({
  Query: configurationQuery(),
  Mutation: configurationMutation(),
  Archivist: {
    id: (archivist: IArchivist) => archivist.id || `http://${get(archivist, 'dns')}:${get(archivist, 'port')}`
  }
})
