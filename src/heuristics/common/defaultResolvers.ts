/*
 * File: defaultResolvers.ts
 * Project: @xyo-network/sdk-core-nodejs
 * File Created: Friday, 13th November 2020 2:22:50 pm
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Friday, 13th November 2020 2:30:21 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2020 XY - The Persistent Company
 */

import { XyoObjectSchema } from '../../schema'
import {
  boundWitnessResolver,
  bridgeHashSetResolver,
  fetterResolver,
  gpsResolver,
  indexResolver,
  keySetResolver,
  latResolver,
  lngResolver,
  paymentKeyResolver,
  previousHashResolver,
  rsaPublicKeyResolver,
  rsaSignatureResolver,
  rssiAt1MResolver,
  rssiResolver,
  secp256K1PublicKeyResolver,
  secp256K1SignatureResolver,
  sha3Resolver,
  sha256Resolver,
  signatureSetResolver,
  stubHashResolver,
  stubPublicKey,
  stubSignatureResolver,
  timeResolver,
  witnessResolver,
} from './resolvers'

const defaultResolvers = [
  {
    id: XyoObjectSchema.BLE_POWER_LEVEL.id,
    resolver: rssiAt1MResolver,
  },
  {
    id: XyoObjectSchema.EC_PUBLIC_KEY.id,
    resolver: secp256K1PublicKeyResolver,
  },
  {
    id: XyoObjectSchema.EC_SIGNATURE.id,
    resolver: secp256K1SignatureResolver,
  },
  {
    id: XyoObjectSchema.INDEX.id,
    resolver: indexResolver,
  },
  {
    id: XyoObjectSchema.LAT.id,
    resolver: latResolver,
  },
  {
    id: XyoObjectSchema.LNG.id,
    resolver: lngResolver,
  },
  {
    id: XyoObjectSchema.PAYMENT_KEY.id,
    resolver: paymentKeyResolver,
  },
  {
    id: XyoObjectSchema.RSA_PUBLIC_KEY.id,
    resolver: rsaPublicKeyResolver,
  },
  {
    id: XyoObjectSchema.RSA_SIGNATURE.id,
    resolver: rsaSignatureResolver,
  },
  {
    id: XyoObjectSchema.RSSI.id,
    resolver: rssiResolver,
  },
  {
    id: XyoObjectSchema.SHA_256.id,
    resolver: sha256Resolver,
  },
  {
    id: XyoObjectSchema.SHA_3.id,
    resolver: sha3Resolver,
  },
  {
    id: XyoObjectSchema.STUB_HASH.id,
    resolver: stubHashResolver,
  },
  {
    id: XyoObjectSchema.STUB_PUBLIC_KEY.id,
    resolver: stubPublicKey,
  },
  {
    id: XyoObjectSchema.STUB_SIGNATURE.id,
    resolver: stubSignatureResolver,
  },
  {
    id: XyoObjectSchema.UNIX_TIME.id,
    resolver: timeResolver,
  },
  {
    id: XyoObjectSchema.GPS.id,
    resolver: gpsResolver,
  },
  {
    id: XyoObjectSchema.BW.id,
    resolver: boundWitnessResolver,
  },
  {
    id: XyoObjectSchema.KEY_SET.id,
    resolver: keySetResolver,
  },
  {
    id: XyoObjectSchema.SIGNATURE_SET.id,
    resolver: signatureSetResolver,
  },
  {
    id: XyoObjectSchema.FETTER.id,
    resolver: fetterResolver,
  },
  {
    id: XyoObjectSchema.WITNESS.id,
    resolver: witnessResolver,
  },
  {
    id: XyoObjectSchema.PREVIOUS_HASH.id,
    resolver: previousHashResolver,
  },
  {
    id: XyoObjectSchema.BRIDGE_HASH_SET.id,
    resolver: bridgeHashSetResolver,
  },
]

export default defaultResolvers
