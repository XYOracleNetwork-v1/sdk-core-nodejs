import { XyoCryptoProvider } from '../dist/xyo-scsc-crypto-provider'

describe('CyptoProvider', async () => {
  let provider: XyoCryptoProvider
  beforeEach(async () => {
    provider = new XyoCryptoProvider()
  })
  it('should encrypt', async () => {
    const { encrypted, salt } = provider.encrypt(
      'password',
      '5408C9896DD9F6EC03DF446E2FE3909AE7DF18A0B3FA7029DD793379B94FB2BA',
    )
    console.log('ENCRYPTED, SALT', encrypted, salt)
    // expect(encrypted).toEqual(
    //   'fa8a24302a8ee1e2c20b55caaebd64128c8bf86f51c7823fe7a4b1fb32899b28',
    // )
  })
  it('should decrypt', async () => {
    const decryption = provider.decrypt(
      'password',
      '0ae7c238d0d24afdf1b9328af68da9c5',
      '33d88dba356e6458',
    )
    expect(decryption).toEqual(
      '5408C9896DD9F6EC03DF446E2FE3909AE7DF18A0B3FA7029DD793379B94FB2BA',
    )
  })
})
