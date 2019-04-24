
export interface IXyoProcedureCatalogue {
  getEncodedCanDo(): Buffer
  canDo(otherCatalogue: Buffer): boolean
  choose(catalogue: Buffer): Buffer
}
