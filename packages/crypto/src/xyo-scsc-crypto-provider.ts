import { XyoBase } from '@xyo-network/base'
import { IXyoCryptoProvider } from './@types'
import crypto from 'crypto'

export class XyoCryptoProvider extends XyoBase implements IXyoCryptoProvider {
  private static algorithm = 'aes-192-cbc'
  // Key length is dependent on the algorithm. In this case for aes192, it is
  // 24 bytes (192 bits).
  // Use the async `crypto.scrypt()` instead.

  public encrypt(
    password: string,
    plainText: string,
  ): { salt: string; encrypted: string } {
    const salt = this.genRandomString(16)
    return this._encrypt(password, plainText, salt)
  }

  public verify(
    password: string,
    salt: string,
    verifyText: string,
    cypherText: string,
  ): boolean {
    const { encrypted } = this._encrypt(password, verifyText, salt)
    return encrypted === cypherText
  }

  public decrypt(password: string, cypherText: string, salt: string): string {
    const key = crypto.scryptSync(password, salt, 24)
    // The IV is usually passed along with the ciphertext.
    const iv = Buffer.alloc(16, 0) // Initialization vector.
    const decipher = crypto.createDecipheriv(
      XyoCryptoProvider.algorithm,
      key,
      iv,
    )
    // Encrypted using same algorithm, key and iv.
    const encrypted = cypherText
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  }

  private _encrypt(
    password: string,
    plainText: string,
    salt: string,
  ): { salt: string; encrypted: string } {
    const key = crypto.scryptSync(password, salt, 24)
    // Use `crypto.randomBytes` to generate a random iv instead of the static iv
    // shown here.
    const iv = Buffer.alloc(16, 0) // Initialization vector.

    const cipher = crypto.createCipheriv(XyoCryptoProvider.algorithm, key, iv)

    let encrypted = cipher.update(plainText, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    return { encrypted, salt }
  }

  /**
   * generates random string of characters i.e salt
   * @function
   * @param {number} length - Length of the random string.
   */
  private genRandomString(length: number) {
    return crypto
      .randomBytes(Math.ceil(length / 2))
      .toString('hex') /** convert to hexadecimal format */
      .slice(0, length) /** return required number of characters */
  }
}
