import { XyoNetworkHandler } from '../network/xyo-network-handler'
import XyoProcedureCatalog from '../network/xyo-procedure-catalog'
import XyoSigner from '../signing/xyo-signer'
import { XyoBoundWitness } from './xyo-bound-witness'

abstract class XyoBoundWitnessHander {
  abstract boundWitness(
    handler: XyoNetworkHandler,
    catalog: XyoProcedureCatalog,
    signers: XyoSigner[]
  ): Promise<XyoBoundWitness | undefined>
}

export default XyoBoundWitnessHander
