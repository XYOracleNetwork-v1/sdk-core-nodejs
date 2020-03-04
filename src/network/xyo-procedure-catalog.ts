/* eslint-disable @typescript-eslint/member-delimiter-style */
/* eslint-disable @typescript-eslint/interface-name-prefix */
export interface IXyoProcedureCatalog {
  getEncodedCanDo(): Buffer
  canDo(otherCatalog: Buffer): boolean
  choose(catalog: Buffer): Buffer
}
