/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 29th October 2018 2:03:22 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-gps-serializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 29th October 2018 2:10:24 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoSerializer } from "../../../xyo-serialization/xyo-serializer";
import { XyoGps } from "./xyo-gps";

export class XyoGpsSerializer extends XyoSerializer<XyoGps> {

  get description () {
    return {
      major: XyoGps.major,
      minor: XyoGps.minor,
      staticSize: 16,
      sizeIdentifierSize: 0
    };
  }

  public serialize(gps: XyoGps): Buffer {
    const buf = Buffer.alloc(16);
    buf.writeDoubleBE(gps.lat, 0);
    buf.writeDoubleBE(gps.long, 8);
    return buf;
  }
  public deserialize(buffer: Buffer): XyoGps {
    const lat = buffer.readDoubleBE(0);
    const long = buffer.readDoubleBE(8);
    return new XyoGps(lat, long);
  }
}
