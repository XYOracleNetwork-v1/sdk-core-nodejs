/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 2:04:50 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-ecdsa-secp256k1-signer-provider.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 7th March 2019 4:56:36 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoSignerProvider, IXyoSignature, IXyoPublicKey } from '@xyo-network/signing'
import { XyoBase } from '@xyo-network/base'
import { ec as EC, EllipticKey } from 'elliptic'
import { XyoEcdsaSecp256k1Signer } from './xyo-ecdsa-secp256k1-signer'
import { IXyoHashProvider } from '@xyo-network/hashing'
import { XyoEcdsaUncompressedPublicKey } from './xyo-ecdsa-uncompressed-public-key'

const ec = new EC('secp256k1')

/**
 * A service for providing EcSecp256k signing services
 */

export class XyoEcdsaSecp256k1SignerProvider extends XyoBase implements IXyoSignerProvider {

  /**
   * Creates an instance of XyoEcdsaSecp256k1SignerProvider.
   * If a HashProvider is provided, that data will be hashed before being signed
   *
   * @param {IXyoHashProvider} [hashProvider] An optional HashProvider
   * @memberof XyoEcdsaSecp256k1SignerProvider
   */
  constructor(
    public hashProvider: IXyoHashProvider | undefined,
    private readonly ecdsaSecp256k1UnCompressedPublicKeyObjectSchemaId: number,
    private readonly ecdsaSecp256k1SignatureObjectSchemaId: number
  ) {
    super()
  }

  /**
   * Returns a new instance of a signer
   */

  public newInstance(fromHexKey?: string) {
    let key: EllipticKey

    if (fromHexKey) {
      const privateKey = ec.keyFromPrivate(fromHexKey, 'hex')
      const correspondingPublicKey = privateKey.getPublic()
      privateKey._importPublic(correspondingPublicKey)
      key = privateKey
    } else {
      key = ec.genKeyPair()
    }

    return new XyoEcdsaSecp256k1Signer(
      this.verifySign.bind(this),
      this.getSignFn(key),
      () => {
        const publicKey = key.getPublic()
        return {
          x: publicKey.x.toBuffer(),
          y: publicKey.y.toBuffer(),
        }
      },
      () => {
        return key.getPrivate('hex')
      },
      this.ecdsaSecp256k1UnCompressedPublicKeyObjectSchemaId,
      this.ecdsaSecp256k1SignatureObjectSchemaId,
    )
  }

  /**
   * Verifies a a signature given the data that was signed, and a public key
   *
   * @param signature The signature to verify
   * @param data The data that was signed
   * @param publicKey The corresponding publicKey of public cryptography key-pair
   */

  public async verifySign(signature: IXyoSignature, data: Buffer, publicKey: IXyoPublicKey): Promise<boolean> {
    const dataToSign = await this.getDataToSign(data)
    const uncompressedEcPublicKey = publicKey as XyoEcdsaUncompressedPublicKey
    const x = uncompressedEcPublicKey.x.toString('hex')
    const y = uncompressedEcPublicKey.y.toString('hex')
    const hexKey = ['04', x, y].join('')
    const key = ec.keyFromPublic(hexKey, 'hex')
    return key.verify(dataToSign, this.buildDER(signature.encodedSignature))
  }

  private getSignFn(key: EllipticKey) {
    return async (data: Buffer) => {
      const dataToSign = await this.getDataToSign(data)
      const signature = key.sign(dataToSign)
      const rBuffer = signature.r.toBuffer()
      const sBuffer = signature.s.toBuffer()

      return Buffer.concat([
        Buffer.from([rBuffer.length]),
        rBuffer,
        Buffer.from([sBuffer.length]),
        sBuffer
      ])
    }
  }

  private async getDataToSign(data: Buffer) {
    if (!this.hashProvider) {
      return data
    }

    const hashedData = await this.hashProvider.createHash(data)
    return hashedData.getHash()
  }

  private buildDER(xyBuffer: Buffer) {
    const sizeOfR = xyBuffer.readUInt8(0)
    const rBuffer = xyBuffer.slice(1, sizeOfR + 1)

    const source = Buffer.concat([
      Buffer.from([0x02]),
      xyBuffer.slice(0, 1),
      rBuffer,
      Buffer.from([0x02]),
      xyBuffer.slice(sizeOfR + 1),
    ])

    const sourceBufferSizeBuffer = Buffer.alloc(1)
    sourceBufferSizeBuffer.writeUInt8(source.length, 0)

    return new Uint8Array(Buffer.concat([
      Buffer.from([0x30]),
      sourceBufferSizeBuffer,
      source
    ]))
  }
}
