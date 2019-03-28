export interface IXyoDescriptor {
  uuid: string
  name: string
  type: string

  readValue(): Promise<Buffer>
  writeValue(value: Buffer): Promise<void>
}
