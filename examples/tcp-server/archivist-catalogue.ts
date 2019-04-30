import { IXyoProcedureCatalog, XyoCatalogFlags } from '../../dist'

export const archivistProcedureCatalog: IXyoProcedureCatalog = {
  getEncodedCanDo: () => {
    return Buffer.from([XyoCatalogFlags.TAKE_ORIGIN_CHAIN | XyoCatalogFlags.BOUND_WITNESS])
  },
  choose: (catalog: Buffer): Buffer => {
    if (catalog.length < 1) {
      throw new Error('Catalog must have at least a byte')
    }

    const catalogInt = catalog.readUInt8(catalog.length - 1)

    if ((catalogInt & XyoCatalogFlags.GIVE_ORIGIN_CHAIN) !== 0) {
      return new Buffer([XyoCatalogFlags.TAKE_ORIGIN_CHAIN])
    }

    return new Buffer([XyoCatalogFlags.BOUND_WITNESS])
  },
  canDo: (buffer: Buffer): boolean => {
    if (buffer.length < 1) {
      return false
    }

    const catalogInt = buffer.readUInt8(0)
    return (catalogInt & (XyoCatalogFlags.GIVE_ORIGIN_CHAIN | XyoCatalogFlags.BOUND_WITNESS)) !== 0
  }
}
