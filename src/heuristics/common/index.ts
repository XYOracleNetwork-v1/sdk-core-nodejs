import { IXyoHeuristicResolver, IXyoHumanHeuristic, XyoHumanHeuristicResolver } from '../xyo-heuristic-resolver'
import bs58 from 'bs58'
import { XyoStructure, XyoIterableStructure } from '../../object-model'
import { XyoObjectSchema } from '../../schema'
import { readUnsignedNumber, readSignedNumber, uniqueIterableToObject, iterableObjectToArray } from './xyo-heuristics-common-util'

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
      name: 'date',
      value: value.readUIntBE(2, 6)
    }
  }
}

export const gpsResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'gps',
      value: uniqueIterableToObject(new XyoIterableStructure(heuristic))
    }
  }
}

export const fetterResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'fetter',
      value: uniqueIterableToObject(new XyoIterableStructure(heuristic))
    }
  }
}

export const witnessResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'witness',
      value: uniqueIterableToObject(new XyoIterableStructure(heuristic))
    }
  }
}

export const keySetResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'keySet',
      value: iterableObjectToArray(new XyoIterableStructure(heuristic))
    }
  }
}

export const signatureSetResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'signatureSet',
      value: iterableObjectToArray(new XyoIterableStructure(heuristic))
    }
  }
}

export const previousHashResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    const children = iterableObjectToArray(new XyoIterableStructure(heuristic))

    if (children.length !== 1) {
      // we expect the previous hash to be a length of 1
      return {
        name: 'previousHash',
        value: 'invalid'
      }
    }

    return {
      name: 'previousHash',
      value: children[0].value
    }
  }
}

export const boundWitnessResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'boundWitness',
      value: iterableObjectToArray(new XyoIterableStructure(heuristic)).map((h) => {
        return h.value
      })
    }
  }
}

export const bridgeHashSetResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'bridgeHashSet',
      value: iterableObjectToArray(new XyoIterableStructure(heuristic)).map((h) => {
        return h.value
      })
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
  XyoHumanHeuristicResolver.addResolver(XyoObjectSchema.GPS.id, gpsResolver)
  XyoHumanHeuristicResolver.addResolver(XyoObjectSchema.BW.id, boundWitnessResolver)
  XyoHumanHeuristicResolver.addResolver(XyoObjectSchema.KEY_SET.id, keySetResolver)
  XyoHumanHeuristicResolver.addResolver(XyoObjectSchema.SIGNATURE_SET.id, signatureSetResolver)
  XyoHumanHeuristicResolver.addResolver(XyoObjectSchema.FETTER.id, fetterResolver)
  XyoHumanHeuristicResolver.addResolver(XyoObjectSchema.WITNESS.id, witnessResolver)
  XyoHumanHeuristicResolver.addResolver(XyoObjectSchema.PREVIOUS_HASH.id, previousHashResolver)
  XyoHumanHeuristicResolver.addResolver(XyoObjectSchema.BRIDGE_HASH_SET.id, bridgeHashSetResolver)
}
