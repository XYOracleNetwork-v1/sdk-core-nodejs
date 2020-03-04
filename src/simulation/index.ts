/* eslint-disable @typescript-eslint/interface-name-prefix */
/* eslint-disable @typescript-eslint/member-delimiter-style */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { XyoZigZagBoundWitness } from '../bound-witness/xyo-zig-zag-bound-witness'
import { XyoStubSigner } from './xyo-stub-signature'
import { XyoRamOriginStateRepository } from './xyo-ram-origin-state-repository'
import { XyoOriginState } from '../origin/xyo-origin-state'
import { IXyoOriginStateRepository } from '../persist'
import { XyoStructure, XyoBuffer } from '../object-model'
import { XyoObjectSchema } from '../schema'
import { XyoBoundWitness } from '../bound-witness'

interface IXyoJsonBoundWitnessCreator {
  createBlocksFromJson(json: string): XyoZigZagBoundWitness[] | Error
}

export class XyoJsonBoundWitnessCreator implements IXyoJsonBoundWitnessCreator {
  private partyToState: Map<string, XyoOriginState> = new Map()

  // tslint:disable-next-line:prefer-array-literal
  public createBlockfromJson(boundWitness: {
    [key: string]: any
  }): XyoZigZagBoundWitness | undefined {
    const allKeys = Object.keys(boundWitness)
    if (allKeys.length > 2 || allKeys.length === 0) {
      throw new Error('Can only support two parties per BoundWitness')
    }
    if (allKeys.length === 2) {
      const alice = allKeys[0] as string
      const bob = allKeys[1] as string
      const aliceState = this.getPartyState(alice)
      const bobState = this.getPartyState(bob)

      const aliceHeuristics = this.createCustomHeuristicArrayWithDefaults(
        [],
        alice
      )
      const bobHeuristics = this.createCustomHeuristicArrayWithDefaults([], bob)

      const boundWitnessAlice = new XyoZigZagBoundWitness(
        aliceState.getSigners(),
        aliceHeuristics,
        []
      )
      const boundWitnessBob = new XyoZigZagBoundWitness(
        bobState.getSigners(),
        bobHeuristics,
        []
      )

      const aliceToBobOne = boundWitnessAlice.incomingData(undefined, false)
      const bobToAliceOne = boundWitnessBob.incomingData(aliceToBobOne, true)
      const aliceToBobTwo = boundWitnessAlice.incomingData(bobToAliceOne, false)
      boundWitnessBob.incomingData(aliceToBobTwo, false)

      aliceState.addOriginBlock(boundWitnessAlice)
      bobState.addOriginBlock(boundWitnessBob)
      return boundWitnessAlice
    }

    return this.createSelfSignedBoundWitness(allKeys[0])
  }

  public createBlocksFromJson(json: string): XyoZigZagBoundWitness[] {
    const bwArray: XyoZigZagBoundWitness[] = []
    // tslint:disable-next-line:prefer-array-literal
    const userData = JSON.parse(json) as Array<{ [key: string]: any }>

    userData.forEach(boundWitness => {
      const cBw = this.createBlockfromJson(boundWitness)

      if (cBw) {
        bwArray.push(cBw)
      }
    })
    this.partyToState = new Map()
    return bwArray
  }

  private createSelfSignedBoundWitness(party: string): XyoZigZagBoundWitness {
    const charlieHeuristics = this.createCustomHeuristicArrayWithDefaults(
      [],
      party
    )
    const charlieState = this.getPartyState(party)
    const boundWitnessCharlie = new XyoZigZagBoundWitness(
      charlieState.getSigners(),
      charlieHeuristics,
      []
    )
    boundWitnessCharlie.incomingData(undefined, true)
    return boundWitnessCharlie
  }

  private createCustomHeuristicArrayWithDefaults(
    heuristics: { [key: string]: any },
    party: string
  ): XyoStructure[] {
    const desiredHeuristics = Object.keys(heuristics)
    const returnedHeuristics: XyoStructure[] = []
    desiredHeuristics.forEach(heuristic => {
      const newHeuristic = this.createHeuristic(
        heuristic,
        heuristics[heuristic]
      )

      if (newHeuristic) {
        returnedHeuristics.push(newHeuristic)
      }
    })
    return this.appendNeededHeuristics(returnedHeuristics, party)
  }

  private createHeuristic(
    heuristic: string,
    value: number | string
  ): XyoStructure | undefined {
    switch (heuristic) {
      case 'rssi': {
        const numBuff = Buffer.alloc(1)
        numBuff.writeInt8(value as number, 0)
        const buffer = new XyoBuffer(numBuff)
        return XyoStructure.newInstance(XyoObjectSchema.RSSI, buffer)
      }
      case 'time': {
        const numBuff = Buffer.alloc(8)
        numBuff.writeUIntBE(value as number, 2, 6)
        const buffer = new XyoBuffer(numBuff)
        return XyoStructure.newInstance(XyoObjectSchema.UNIX_TIME, buffer)
      }
    }
  }

  private appendNeededHeuristics(
    heuristcs: any[],
    party: string
  ): XyoStructure[] {
    const state = this.getPartyState(party)
    if (!state) {
      return []
    }

    const hash = state.getPreviousHash()
    if (hash) {
      heuristcs.push(hash)
    }

    heuristcs.push(state.getIndex())
    return heuristcs
  }

  private getPartyState(party: string): XyoOriginState {
    let partyState = this.partyToState.get(party)
    if (!partyState) {
      const signer = new XyoStubSigner(Buffer.from(party))
      const stateRepo = new XyoRamOriginStateRepository()
      const state = new XyoOriginState(stateRepo)
      state.addSigner(signer)
      this.partyToState.set(party, state)
      partyState = this.partyToState.get(party)
    }
    return partyState as XyoOriginState
  }

  private setPartyState(party: string, state: XyoOriginState): void {
    this.partyToState.set(party, state)
  }
}
