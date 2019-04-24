import { IXyoProcedureCatalogue } from '../network/xyo-procedure-catalogue'
import { XyoBoundWitness } from './xyo-bound-witness'
import { XyoNetworkHandler } from '../network/xyo-network-handler'
import { IXyoSigner } from '../signing/xyo-signer'

export interface IXyoBoundWitnessHander {
  boundWitness (handler: XyoNetworkHandler, catalogue: IXyoProcedureCatalogue, signers: IXyoSigner[]): Promise<XyoBoundWitness | undefined >
}
