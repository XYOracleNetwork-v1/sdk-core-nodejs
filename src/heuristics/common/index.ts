import { IXyoHeuristicResolver, IXyoHumanHeuristic, XyoHumanHeuristicResolver } from '../xyo-heuristic-resolver'
import bs58 from 'bs58'
import { XyoStructure, XyoIterableStructure } from '@xyo-network/object-model'
import { XyoObjectSchema } from '../../schema'

const readSignedNumber  = (buffer: Buffer): number => {
  switch (buffer.length) {
    case 1: return buffer.readInt8(0)
    case 2: return buffer.readInt16BE(0)
    case 4: return buffer.readInt32BE(0)
  }

  return -1
}

const readUnsignedNumber  = (buffer: Buffer): number => {
  switch (buffer.length) {
    case 1: return buffer.readUInt8(0)
    case 2: return buffer.readUInt16BE(0)
    case 4: return buffer.readUInt32BE(0)
  }

  return -1
}

export const nextPublicKeyResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    const key = new XyoIterableStructure(heuristic).get(0)

    return {
      name: 'nextPublicKey',
      value: XyoHumanHeuristicResolver.resolve(key.getAll().getContentsCopy())
    }
  }
}

export const paymentKeyResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    const key = new XyoIterableStructure(heuristic).get(0)

    return {
      name: 'paymentKey',
      value: heuristic.toString('base64')
    }
  }
}

export const secp256K1SignatureResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'secp566k1Signature',
      value: heuristic.toString('base64')
    }
  }
}

export const rsaSignatureResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {

    return {
      name: 'rsaSignature',
      value: heuristic.toString('base64')
    }
  }
}

export const secp256K1PublicKeyResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'secp566k1PublicKey',
      value: bs58.encode(heuristic)
    }
  }
}

export const indexResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'index',
      value: readUnsignedNumber(new XyoStructure(heuristic).getValue().getContentsCopy())
    }
  }
}

export const rssiResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'rssi',
      value: readSignedNumber(new XyoStructure(heuristic).getValue().getContentsCopy())
    }
  }
}

export const rssiAt1MResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'rssiAt1m',
      value: readSignedNumber(new XyoStructure(heuristic).getValue().getContentsCopy())
    }
  }
}

export const stubSignatureResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {

    return {
      name: 'stubSignature',
      value: heuristic.toString('base64')
    }
  }
}

export const rsaPublicKeyResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'rsaPublicKey',
      value: bs58.encode(heuristic)
    }
  }
}

export const stubPublicKey: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'stubPublicKey',
      value: bs58.encode(heuristic)
    }
  }
}

export const stubHashResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'stubHash',
      value: bs58.encode(heuristic)
    }
  }
}

export const sha256Resolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'sha256',
      value: bs58.encode(heuristic)
    }
  }
}

export const sha3Resolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'sha3',
      value: bs58.encode(heuristic)
    }
  }
}

export const latResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    const value = new XyoStructure(heuristic).getValue().getContentsCopy()
    return {
      name: 'lat',
      value: value.readDoubleBE(0)
    }
  }
}

export const lngResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    const value = new XyoStructure(heuristic).getValue().getContentsCopy()
    return {
      name: 'lng',
      value: value.readDoubleBE(0)
    }
  }
}

export const timeResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    const value = new XyoStructure(heuristic).getValue().getContentsCopy()

    return {
      name: 'lng',
      value: new Date(value.readUIntBE(0, 6) / 1000).toString()
    }
  }
}

export const addAllDefaults = () => {
  XyoHumanHeuristicResolver.addResolver(XyoObjectSchema.BLE_POWER_LEVEL.id, rssiAt1MResolver)
  XyoHumanHeuristicResolver.addResolver(XyoObjectSchema.EC_PUBLIC_KEY.id, secp256K1PublicKeyResolver)
  XyoHumanHeuristicResolver.addResolver(XyoObjectSchema.EC_SIGNATURE.id, secp256K1SignatureResolver)
  XyoHumanHeuristicResolver.addResolver(XyoObjectSchema.INDEX.id, indexResolver)
  XyoHumanHeuristicResolver.addResolver(XyoObjectSchema.LAT.id, latResolver)
  XyoHumanHeuristicResolver.addResolver(XyoObjectSchema.LNG.id, lngResolver)
  XyoHumanHeuristicResolver.addResolver(XyoObjectSchema.PAYMENT_KEY.id, paymentKeyResolver)
  XyoHumanHeuristicResolver.addResolver(XyoObjectSchema.RSA_PUBLIC_KEY.id, rsaPublicKeyResolver)
  XyoHumanHeuristicResolver.addResolver(XyoObjectSchema.RSA_SIGNATURE.id, rsaSignatureResolver)
  XyoHumanHeuristicResolver.addResolver(XyoObjectSchema.RSSI.id, rssiResolver)
  XyoHumanHeuristicResolver.addResolver(XyoObjectSchema.SHA_256.id, sha256Resolver)
  XyoHumanHeuristicResolver.addResolver(XyoObjectSchema.SHA_3.id, sha3Resolver)
  XyoHumanHeuristicResolver.addResolver(XyoObjectSchema.STUB_HASH.id, stubHashResolver)
  XyoHumanHeuristicResolver.addResolver(XyoObjectSchema.STUB_PUBLIC_KEY.id, stubPublicKey)
  XyoHumanHeuristicResolver.addResolver(XyoObjectSchema.STUB_SIGNATURE.id, stubSignatureResolver)
  XyoHumanHeuristicResolver.addResolver(XyoObjectSchema.UNIX_TIME.id, timeResolver)
}
