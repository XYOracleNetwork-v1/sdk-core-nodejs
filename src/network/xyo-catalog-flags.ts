export class XyoCatalogFlags {
  public static BOUND_WITNESS = 1
  public static TAKE_ORIGIN_CHAIN = 2
  public static GIVE_ORIGIN_CHAIN = 4

  public static flip(flags: Buffer): Buffer {
    if (flags.length === 0) {
      return flags
    }

    if ((flags[0] & XyoCatalogFlags.TAKE_ORIGIN_CHAIN) !== 0) {
      return new Buffer([XyoCatalogFlags.GIVE_ORIGIN_CHAIN])
    }

    if ((flags[0] & XyoCatalogFlags.GIVE_ORIGIN_CHAIN) !== 0) {
      return new Buffer([XyoCatalogFlags.TAKE_ORIGIN_CHAIN])
    }

    return new Buffer([XyoCatalogFlags.BOUND_WITNESS])
  }
}
