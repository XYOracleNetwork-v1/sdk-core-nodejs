
export interface IXyoProcedureCatalog {
  getEncodedCanDo(): Buffer
  canDo(otherCatalog: Buffer): boolean
  choose(catalog: Buffer): Buffer
}
