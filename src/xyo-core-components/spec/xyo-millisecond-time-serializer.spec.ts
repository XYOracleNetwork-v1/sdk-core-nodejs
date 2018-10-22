import { XyoMillisecondTime } from "../heuristics/numbers/xyo-millisecond-time";
import { XyoObject } from "../xyo-object";
import { XyoDefaultPackerProvider } from "../../xyo-serialization/xyo-default-packer-provider";

describe(`XyoMillisecondTimeSerializer`, () => {
  it(`Should serialize and deserialize`, () => {
    XyoObject.packer = new XyoDefaultPackerProvider().getXyoPacker();
    const t1 = new Date().valueOf();
    const time = new XyoMillisecondTime(t1);
    const serializedTime = time.serialize(true);
    const deserializedTime = XyoObject.deserialize<XyoMillisecondTime>(serializedTime);
    expect(time.isEqual(deserializedTime)).toBe(true);
    expect(deserializedTime.number).toBe(t1);
  });
});
