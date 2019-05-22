import { XyoSize } from './xyo-size'

export class XyoSizeUtil {
  public static getBestSize (size: number): XyoSize {
    if (size + 1 < (2 ** 8)) {
      return XyoSize.ONE
    }

    if (size + 2 < (2 ** 16)) {
      return XyoSize.TWO
    }

    if (size + 4 < (2 ** 32)) {
      return XyoSize.FOUR
    }

    return XyoSize.EIGHT
  }
}
