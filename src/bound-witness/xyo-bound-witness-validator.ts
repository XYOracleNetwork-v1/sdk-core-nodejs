import { XyoSignatureVerify } from '../signing/xyo-signer'
import { XyoBoundWitness } from './xyo-bound-witness'

export class XyoBoundWitnessValidator {
  private signatureValidators: Map<number, XyoSignatureVerify>

  constructor(signatureValidators: Map<number, XyoSignatureVerify>) {
    this.signatureValidators = signatureValidators
  }

  public validate(boundWitness: XyoBoundWitness, allowUnknownSignatures: boolean): boolean {
    const signingData = boundWitness.getSigningData()
    const publicKeysParty = boundWitness.getPublicKeys()
    const signaturesParty = boundWitness.getSignatures()

    if (publicKeysParty.length !== publicKeysParty.length) {
      return false
    }

    for (let i = 0; i < publicKeysParty.length; i++) {
      const publicKeys = publicKeysParty[i]
      const signatures = signaturesParty[i]

      if (publicKeysParty.length !== signaturesParty.length) {
        return false
      }

      for (let j = 0; j < publicKeys.length; j++) {
        const publicKey = publicKeys[j]
        const signature = signatures[j]
        const signatureValidator = this.signatureValidators.get(signature.getSchema().id)

        if (signatureValidator) {
          if (!signatureValidator(publicKey.getAll().getContentsCopy(), signature.getAll().getContentsCopy(), signingData)) {
            return false
          }
        } else if (signatureValidator && !allowUnknownSignatures) {
          return false
        }
      }
    }

    return true
  }
}
