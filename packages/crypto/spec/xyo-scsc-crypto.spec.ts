import { XyoCryptoProvider } from '../dist/xyo-scsc-crypto-provider'

describe('CyptoProvider', async () => {
  let provider: XyoCryptoProvider
  beforeEach(async () => {
    provider = new XyoCryptoProvider()
  })
  it('should encrypt', async () => {
    const encryption = provider.encrypt('pass', 'something to encrypt')
    expect(encryption).toEqual(
      'fa8a24302a8ee1e2c20b55caaebd64128c8bf86f51c7823fe7a4b1fb32899b28',
    )
  })
  it('should decrypt', async () => {
    const decryption = provider.decrypt(
      'pass',
      'fa8a24302a8ee1e2c20b55caaebd64128c8bf86f51c7823fe7a4b1fb32899b28',
    )
    expect(decryption).toEqual('something to encrypt')
  })
})
