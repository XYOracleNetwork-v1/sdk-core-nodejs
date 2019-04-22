export interface IXyoCryptoProvider {
  encrypt(password: string, plainText: string): { salt: string, encrypted: string }
  decrypt(password: string, cypherText: string, salt: string): string
  verify(password: string, salt: string, verifyText: string, cypherText: string): boolean
}
