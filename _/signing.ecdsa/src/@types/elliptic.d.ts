/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Tuesday, 20th November 2018 2:06:46 pm
 * @Email:  developer@xyfindables.com
 * @Filename: elliptic.d.ts

 * @Last modified time: Tuesday, 20th November 2018 2:06:50 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

/**
 * Elliptic library does not supply types. This is partial implementation
 * of the types that are required for this project to use. If, however,
 * more elliptic functionality is required that is specified in this file,
 * it can be extended.
 */

declare module 'elliptic' {
  type CurvePreset = 'secp256k1'
    | 'p192'
    | 'p224'
    | 'p256'
    | 'p384'
    | 'p521'
    | 'curve25519'
    | 'ed25519'

  class EllipticPoint {
    public toBuffer(): Buffer
  }

  class EllipticPublicKey {
    public x: EllipticPoint
    public y: EllipticPoint
  }

  class EllipticSignature {
    public r: BN
    public s: BN
  }

  class BN {
    public toBuffer(): Buffer
  }

  class EllipticKey {
    public sign(message: any[] | Buffer | string): EllipticSignature
    public getPublic(): EllipticPublicKey
    public getPublic(encoding: string): string
    public getPrivate(encoding: string): string
    public _importPublic(publicKey: EllipticPublicKey): void
    public verify(message: Buffer, signature: Uint8Array): Promise<boolean>
  }

  class EllipticCurve {
    constructor(preset: CurvePreset);
    public genKeyPair(): EllipticKey
    public keyFromPublic(publicKey: string, type: 'hex'): EllipticKey
    public keyFromPrivate(privateKey: string, type: 'hex'): EllipticKey
  }

  export {
    EllipticCurve as ec,
    EllipticKey
  }
}
