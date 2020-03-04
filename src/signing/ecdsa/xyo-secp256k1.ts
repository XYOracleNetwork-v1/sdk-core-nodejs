/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { IXyoSigner, XyoSignatureVerify } from '../xyo-signer'
import elliptic from 'elliptic'
import { XyoObjectSchema } from '../../schema'
import { XyoBuffer, XyoStructure } from '../../object-model'

const ec = new elliptic.ec('secp256k1')

export class XyoSecp2556k1 implements IXyoSigner {
  public static verify: XyoSignatureVerify = async (
    publicKey: Buffer,
    signature: Buffer,
    data: Buffer
  ): Promise<boolean> => {
    const signatureStructure = new XyoStructure(new XyoBuffer(signature))
    const publicKeyStructure = new XyoStructure(new XyoBuffer(publicKey))
    const derSignature = XyoSecp2556k1.buildDerSignature(
      signatureStructure.getValue().getContentsCopy()
    )

    const x = publicKeyStructure.getValue().copyRangeOf(0, 31)
    const y = publicKeyStructure.getValue().copyRangeOf(32, 64)
    const hexKey = ['04', x, y].join('')
    const key = ec.keyFromPublic(hexKey, 'hex')
    return key.verify(data, derSignature)
  }

  private static buildDerSignature(xyBuffer: Buffer) {
    const sizeOfR = xyBuffer.readUInt8(0)
    const rBuffer = xyBuffer.slice(1, sizeOfR + 1)

    const source = Buffer.concat([
      Buffer.from([0x02]),
      xyBuffer.slice(0, 1),
      rBuffer,
      Buffer.from([0x02]),
      xyBuffer.slice(sizeOfR + 1)
    ])

    const sourceBufferSizeBuffer = Buffer.alloc(1)
    sourceBufferSizeBuffer.writeUInt8(source.length, 0)

    return Buffer.concat([
      Buffer.from([0x30]),
      sourceBufferSizeBuffer,
      source
    ]).toString('hex')
  }

  private key: elliptic.ec.KeyPair

  constructor(key?: Buffer) {
    if (key) {
      const structure = new XyoStructure(key)
      const privateKey = structure.getValue().getContentsCopy()
      this.key = ec.keyFromPrivate(privateKey)
      return
    }

    this.key = ec.genKeyPair()
  }

  public sign(data: Buffer): XyoStructure {
    const signature = this.key.sign(data)

    const rBuffer = signature.r.toBuffer()
    const sBuffer = signature.s.toBuffer()

    const value = Buffer.concat([
      Buffer.from([rBuffer.length]),
      rBuffer,
      Buffer.from([sBuffer.length]),
      sBuffer
    ])

    return XyoStructure.newInstance(
      XyoObjectSchema.EC_SIGNATURE,
      new XyoBuffer(value)
    )
  }

  public getPublicKey(): XyoStructure {
    const key = this.key.getPublic()
    const x = key.getX().toBuffer()
    const y = key.getY().toBuffer()

    const buffer = Buffer.concat([
      this.writePointTo32ByteBuffer(x),
      this.writePointTo32ByteBuffer(y)
    ])

    return XyoStructure.newInstance(
      XyoObjectSchema.EC_PUBLIC_KEY,
      new XyoBuffer(buffer)
    )
  }

  public getPrivateKey(): XyoStructure {
    const privateKey = this.key.getPrivate('hex').toString()
    const buffer = new XyoBuffer(Buffer.from(privateKey, 'hex'))

    return XyoStructure.newInstance(XyoObjectSchema.EC_PRIVATE_KEY, buffer)
  }

  private writePointTo32ByteBuffer(point: Buffer) {
    if (point.length === 32) {
      return point
    }
    const dest = Buffer.alloc(32)
    const offset = dest.length - point.length
    let index = 0

    while (index < point.length) {
      dest[offset + index] = point[index]
      index += 1
    }

    return dest
  }
}
