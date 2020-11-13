abstract class XyoProcedureCatalog {
  abstract getEncodedCanDo(): Buffer
  abstract canDo(otherCatalog: Buffer): boolean
  abstract choose(catalog: Buffer): Buffer
}

export default XyoProcedureCatalog
