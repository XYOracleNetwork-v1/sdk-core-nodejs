/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 2:06:46 pm
 * @Email:  developer@xyfindables.com
 * @Filename: elliptic.d.ts
 * @Last modified by: ryanxyo
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
  ;

  class EllipticPoint {
    toBuffer(): Buffer
  }

  class EllipticPublicKey {
    x: EllipticPoint;
    y: EllipticPoint
  }

  class EllipticSignature {
    r: BN;
    s: BN;
  }

  class BN {
    toBuffer(): Buffer;
  }

  class EllipticKey {
    sign(message: Array<any> | Buffer | string): EllipticSignature;
    getPublic(): EllipticPublicKey;
    getPublic(encoding: string): string;
    getPrivate(encoding: string): string;
    _importPublic(publicKey: EllipticPublicKey): void;
    verify(message: Buffer, signature: Uint8Array): Promise<boolean>;
  }

  class EllipticCurve {
    constructor(preset: CurvePreset);
    genKeyPair(): EllipticKey;
    keyFromPublic(publicKey: string, type: 'hex'): EllipticKey;
    keyFromPrivate(privateKey: string, type: 'hex'): EllipticKey;
  }

  export {
    EllipticCurve as ec,
    EllipticKey
  }
}