import { IXyoSigner } from '../xyo-signer'
import { XyoStructure, XyoBuffer } from '@xyo-network/object-model'
import { ec as EC, EllipticKey } from 'elliptic'
import { XyoObjectSchema } from '../../schema'

const ec = new EC('secp256k1')

export class XyoSecp2556k1 implements IXyoSigner {

  private key: EllipticKey

  constructor(key?: EllipticKey) {
    if (key) {
      this.key = key
      return
    }

    this.key = ec.genKeyPair()
  }

  public sign (data: Buffer): XyoStructure {
    const signature = this.key.sign(data)

    const rBuffer = signature.r.toBuffer()
    const sBuffer = signature.s.toBuffer()

    const value = Buffer.concat([
      Buffer.from([rBuffer.length]),
      rBuffer,
      Buffer.from([sBuffer.length]),
      sBuffer
    ])

    return XyoStructure.newInstance(XyoObjectSchema.SIGNATURE_SET, new XyoBuffer(value))
  }

  public getPublicKey (): XyoStructure {
    const key = this.key.getPublic()
    const x = key.x.toBuffer()
    const y = key.y.toBuffer()

    const buffer = Buffer.concat([
      this.writePointTo32ByteBuffer(x),
      this.writePointTo32ByteBuffer(y)
    ])

    return XyoStructure.newInstance(XyoObjectSchema.EC_PUBLIC_KEY, new XyoBuffer(buffer))
  }

  public getPrivateKey (): XyoStructure {
    const privateKey = this.key.getPrivate('hex')
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
