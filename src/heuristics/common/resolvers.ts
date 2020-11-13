/*
 * File: index copy.ts
 * Project: @xyo-network/sdk-core-nodejs
 * File Created: Friday, 13th November 2020 2:27:23 pm
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Friday, 13th November 2020 2:31:15 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2020 XY - The Persistent Company
 */

import bs58 from 'bs58'

import { XyoIterableStructure, XyoStructure } from '../../object-model'
import {
  IXyoHeuristicResolver,
  IXyoHumanHeuristic,
  XyoHumanHeuristicResolver,
} from '../xyo-heuristic-resolver'
import {
  iterableObjectToArray,
  readSignedNumber,
  readUnsignedNumber,
  uniqueIterableToObject,
} from './xyo-heuristics-common-util'

export const nextPublicKeyResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    const key = new XyoIterableStructure(heuristic).get(0)

    return {
      name: 'nextPublicKey',
      value: XyoHumanHeuristicResolver.resolve(key.getAll().getContentsCopy()),
    }
  },
}

export const paymentKeyResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    //const key = new XyoIterableStructure(heuristic).get(0)

    return {
      name: 'paymentKey',
      value: heuristic.toString('base64'),
    }
  },
}

export const secp256K1SignatureResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'secp566k1Signature',
      value: heuristic.toString('base64'),
    }
  },
}

export const rsaSignatureResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'rsaSignature',
      value: heuristic.toString('base64'),
    }
  },
}

export const secp256K1PublicKeyResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'secp566k1PublicKey',
      value: bs58.encode(heuristic),
    }
  },
}

export const indexResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'index',
      value: readUnsignedNumber(
        new XyoStructure(heuristic).getValue().getContentsCopy()
      ),
    }
  },
}

export const rssiResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'rssi',
      value: readSignedNumber(
        new XyoStructure(heuristic).getValue().getContentsCopy()
      ),
    }
  },
}

export const rssiAt1MResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'rssiAt1m',
      value: readSignedNumber(
        new XyoStructure(heuristic).getValue().getContentsCopy()
      ),
    }
  },
}

export const stubSignatureResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'stubSignature',
      value: heuristic.toString('base64'),
    }
  },
}

export const rsaPublicKeyResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'rsaPublicKey',
      value: bs58.encode(heuristic),
    }
  },
}

export const stubPublicKey: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'stubPublicKey',
      value: bs58.encode(heuristic),
    }
  },
}

export const stubHashResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'stubHash',
      value: bs58.encode(heuristic),
    }
  },
}

export const sha256Resolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'sha256',
      value: bs58.encode(heuristic),
    }
  },
}

export const sha3Resolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'sha3',
      value: bs58.encode(heuristic),
    }
  },
}

export const latResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    const value = new XyoStructure(heuristic).getValue().getContentsCopy()
    return {
      name: 'lat',
      value: value.readDoubleBE(0),
    }
  },
}

export const lngResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    const value = new XyoStructure(heuristic).getValue().getContentsCopy()
    return {
      name: 'lng',
      value: value.readDoubleBE(0),
    }
  },
}

export const timeResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    const value = new XyoStructure(heuristic).getValue().getContentsCopy()
    return {
      name: 'date',
      value: value.readUIntBE(2, 6),
    }
  },
}

export const gpsResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'gps',
      value: uniqueIterableToObject(new XyoIterableStructure(heuristic)),
    }
  },
}

export const fetterResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'fetter',
      value: uniqueIterableToObject(new XyoIterableStructure(heuristic)),
    }
  },
}

export const witnessResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'witness',
      value: uniqueIterableToObject(new XyoIterableStructure(heuristic)),
    }
  },
}

export const keySetResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'keySet',
      value: iterableObjectToArray(new XyoIterableStructure(heuristic)),
    }
  },
}

export const signatureSetResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'signatureSet',
      value: iterableObjectToArray(new XyoIterableStructure(heuristic)),
    }
  },
}

export const previousHashResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    const children = iterableObjectToArray(new XyoIterableStructure(heuristic))

    if (children.length !== 1) {
      // we expect the previous hash to be a length of 1
      return {
        name: 'previousHash',
        value: 'invalid',
      }
    }

    return {
      name: 'previousHash',
      value: children[0].value,
    }
  },
}

export const boundWitnessResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'boundWitness',
      value: iterableObjectToArray(new XyoIterableStructure(heuristic)).map(
        (h) => {
          return h.value
        }
      ),
    }
  },
}

export const bridgeHashSetResolver: IXyoHeuristicResolver = {
  resolve(heuristic: Buffer): IXyoHumanHeuristic {
    return {
      name: 'bridgeHashSet',
      value: iterableObjectToArray(new XyoIterableStructure(heuristic)).map(
        (h) => {
          return h.value
        }
      ),
    }
  },
}
