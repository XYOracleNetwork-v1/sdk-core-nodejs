/* eslint-disable @typescript-eslint/interface-name-prefix */
/* eslint-disable @typescript-eslint/member-delimiter-style */
import { IXyoProcedureCatalog } from '../network/xyo-procedure-catalog'
import { XyoBoundWitness } from './xyo-bound-witness'
import { XyoNetworkHandler } from '../network/xyo-network-handler'
import { IXyoSigner } from '../signing/xyo-signer'

export interface IXyoBoundWitnessHander {
  boundWitness(
    handler: XyoNetworkHandler,
    catalog: IXyoProcedureCatalog,
    signers: IXyoSigner[]
  ): Promise<XyoBoundWitness | undefined>
}
