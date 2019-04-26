import { IXyoProcedureCatalogue, XyoCatalogueFlags } from '../../dist'

export const archivistProcedureCatalogue: IXyoProcedureCatalogue = {
  getEncodedCanDo: () => {
    return Buffer.from([XyoCatalogueFlags.TAKE_ORIGIN_CHAIN | XyoCatalogueFlags.BOUND_WITNESS])
  },
  choose: (catalogue: Buffer): Buffer => {
    if (catalogue.length < 1) {
      throw new Error('Catalogue must have at least a byte')
    }

    const catalogueInt = catalogue.readUInt8(0)

    if ((catalogueInt & XyoCatalogueFlags.GIVE_ORIGIN_CHAIN) !== 0) {
      return new Buffer([XyoCatalogueFlags.TAKE_ORIGIN_CHAIN])
    }

    return new Buffer([XyoCatalogueFlags.BOUND_WITNESS])
  },
  canDo: (buffer: Buffer): boolean => {
    if (buffer.length < 1) {
      return false
    }

    const catalogueInt = buffer.readUInt8(0)
    return (catalogueInt & (XyoCatalogueFlags.GIVE_ORIGIN_CHAIN | XyoCatalogueFlags.BOUND_WITNESS)) !== 0
  }
}
