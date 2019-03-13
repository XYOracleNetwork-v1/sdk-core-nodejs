import { IXyoHash } from '@xyo-network/hashing'
import { IXyoSerializableObject } from '@xyo-network/serialization'

/**
 * An abstraction over a content-addressable-service like ipfs
 *
 * @export
 * @interface IXyoContentAddressableService
 */

export interface IXyoContentAddressableService {

  /**
   * Returns the value for key, undefined if not found
   *
   * @param {IContentAddress} key
   * @returns {(Promise<Buffer | undefined>)}
   * @memberof IXyoContentAddressableService
   */
  get(key: IContentAddress): Promise<Buffer | undefined>

  /**
   * Adds a value to storage, returns the key that it can be retrieved by
   *
   * @param {(Buffer | IXyoSerializableObject)} value
   * @returns {Promise<string>}
   * @memberof IXyoContentAddressableService
   */
  add(value: Buffer | IXyoSerializableObject): Promise<string>
}

export type IContentAddress = IXyoHash | string | Buffer
