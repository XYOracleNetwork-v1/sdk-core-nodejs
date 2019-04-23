import { XyoSchema } from '@xyo-network/object-model'

export class XyoObjectSchema {
  public static ARRAY_TYPED = new XyoSchema(1, 0xb0)
  public static ARRAY_UNTYPED = new XyoSchema(1, 0xb0)
  public static BW = new XyoSchema(2, 0xa0)
  public static INDEX = new XyoSchema(3, 0x80)
  public static NEXT_PUBLIC_KEY = new XyoSchema(4, 0x80)
  public static BRIDGE_BLOCK_SET = new XyoSchema(5, 0xa0)
  public static BRIDGE_HASH_SET = new XyoSchema(6, 0xb0)
  public static PAYMENT_KEY = new XyoSchema(7, 0x80)
  public static PREVIOUS_HASH = new XyoSchema(8, 0xa0)
  public static EC_SIGNATURE = new XyoSchema(9, 0x80)
  public static RSA_SIGNATURE = new XyoSchema(10, 0x80)
  public static STUB_SIGNATURE = new XyoSchema(11, 0x80)
  public static EC_PUBLIC_KEY = new XyoSchema(12, 0x80)

  public static RSA_PUBLIC_KEY = new XyoSchema(13, 0x80)
  public static STUB_PUBLIC_KEY = new XyoSchema(14, 0x80)
  public static STUB_HASH = new XyoSchema(15, 0x80)
  public static SHA_256 = new XyoSchema(16, 0x80)
  public static SHA_3 = new XyoSchema(17, 0x80)
  public static GPS = new XyoSchema(18, 0xa0)
  public static RSSI = new XyoSchema(19, 0x80)
  public static UNIX_TIME = new XyoSchema(20, 0x80)

  public static FETTER = new XyoSchema(21, 0xa0)
  public static FETTER_SET = new XyoSchema(22, 0xb0)
  public static WITNESS = new XyoSchema(23, 0xa0)
  public static WITNESS_SET = new XyoSchema(24, 0xb0)
  public static KEY_SET = new XyoSchema(25, 0xa0)
  public static SIGNATURE_SET = new XyoSchema(26, 0xa0)
  public static BW_FRAGMENT = new XyoSchema(27, 0xa0)
  public static LAT = new XyoSchema(28, 0x80)
  public static LNG = new XyoSchema(29, 0x80)
  public static BLE_POWER_LEVEL = new XyoSchema(30, 0x80)

  public static EC_PRIVATE_KEY = new XyoSchema(0xff, 0x80)
}
