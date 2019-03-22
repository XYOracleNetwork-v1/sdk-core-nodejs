/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 8th March 2019 1:32:51 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 8th March 2019 2:58:53 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoContentAddressableService, IContentAddress } from './@types'
import { IXyoSerializableObject } from '@xyo-network/serialization'
import { XyoBase } from '@xyo-network/base'
import { IXyoHashProvider } from '@xyo-network/hashing'
import { XyoError } from '@xyo-network/errors'
import { IXyoStorageProvider } from '@xyo-network/storage'

export { IContentAddress, IXyoContentAddressableService } from './@types'

/**
 * Provides local content addressable service. Additionally provides key and value
 * converters so keys and values can be processed before persistance. This may be useful
 * for testing so values are stored and retrieved in readable hexadecimal or useful for
 * encryption before persisting.
 *
 * @export
 * @class XyoLocalContentService
 * @extends {XyoBase}
 * @implements {IXyoContentAddressableService}
 */

export class XyoLocalContentService extends XyoBase implements IXyoContentAddressableService {

  constructor(
    private readonly hashProvider: IXyoHashProvider,
    private readonly storageProvider: IXyoStorageProvider,
    private readonly keyConverter?: (k: Buffer) => Buffer,
    private readonly valConverter?: (v: Buffer) => Buffer
  ) {
    super()
  }

  public async get(key: IContentAddress): Promise<Buffer | undefined> {
    try {
      const derivedKey = contentAddressableToString(key)
      return this.storageProvider.read(
        this.keyConverter ? this.keyConverter(Buffer.from(derivedKey)) : Buffer.from(derivedKey)
      )
    } catch (e) { // swallow
      return undefined
    }
  }

  public async add(value: IXyoSerializableObject | Buffer): Promise<string> {
    const v = value instanceof Buffer ? value : value.serialize()
    const keyHash = await this.hashProvider.createHash(v)
    const strKey = keyHash.getHash().toString()
    await this.storageProvider.write(
      this.keyConverter ? this.keyConverter(Buffer.from(strKey)) : Buffer.from(strKey),
      this.valConverter ? this.valConverter(Buffer.from(v)) : Buffer.from(v)
    )

    return strKey
  }
}

export function contentAddressableToString(contentAddress: IContentAddress): string {
  if (!contentAddress) throw new XyoError(`contentAddress must be a value`)
  if (typeof contentAddress === 'string') return contentAddress
  if (contentAddress instanceof Buffer) return contentAddress.toString()
  if (contentAddress.schemaObjectId) return contentAddress.serialize().toString()

  throw new XyoError(`Could not convert contentAddressable to string`)
}
