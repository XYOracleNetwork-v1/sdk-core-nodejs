import { XyoSecp2556k1 } from '../../signing/ecdsa/xyo-secp256k1'
import { XyoZigZagBoundWitness } from '../xyo-zig-zag-bound-witness'

describe('XyoZigZagBoundWitness', () => {
  it('Self Sign Block', () => {
    const signers = [new XyoSecp2556k1()]
    const boundWitness = new XyoZigZagBoundWitness(signers, [], [])

    boundWitness.incomingData(undefined, true)

    expect(boundWitness.getIsCompleted()).toBe(true)
    expect(boundWitness.getNumberOfParties()).toBe(1)
    expect(boundWitness.getNumberOfWitnesses()).toBe(1)
    expect(boundWitness.getNumberOfFetters()).toBe(1)
  })

  it('2 Party Block', () => {
    const signersAlice = [new XyoSecp2556k1()]
    const signersBob = [new XyoSecp2556k1()]
    const boundWitnessAlice = new XyoZigZagBoundWitness(signersAlice, [], [])
    const boundWitnessBob = new XyoZigZagBoundWitness(signersBob, [], [])

    const aliceToBobOne = boundWitnessAlice.incomingData(undefined, false)
    const bobToAliceOne = boundWitnessBob.incomingData(aliceToBobOne, true)
    const aliceToBobTwo = boundWitnessAlice.incomingData(bobToAliceOne, false)
    boundWitnessBob.incomingData(aliceToBobTwo, false)

    expect(boundWitnessAlice.getIsCompleted()).toBe(true)
    expect(boundWitnessAlice.getNumberOfParties()).toBe(2)
    expect(boundWitnessAlice.getNumberOfWitnesses()).toBe(2)
    expect(boundWitnessAlice.getNumberOfFetters()).toBe(2)

    expect(boundWitnessBob.getIsCompleted()).toBe(true)
    expect(boundWitnessBob.getNumberOfParties()).toBe(2)
    expect(boundWitnessBob.getNumberOfWitnesses()).toBe(2)
    expect(boundWitnessBob.getNumberOfFetters()).toBe(2)

    const aliceBytes = boundWitnessAlice
      .getAll()
      .getContentsCopy()
      .toString('hex')
    const bobBytes = boundWitnessBob
      .getAll()
      .getContentsCopy()
      .toString('hex')

    expect(aliceBytes).toEqual(bobBytes)
  })
})
