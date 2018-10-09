/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 17th August 2018 4:41:28 pm
 * @Email:  developer@xyfindables.com
 * @Filename: in-memory-storage-provider.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 3:07:03 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoInMemoryStorageProvider } from '../../xyo-storage/xyo-in-memory-storage-provider';
import { XyoStoragePriority } from '../../xyo-storage/xyo-storage-priority';

describe('Storage', () => {
  it(`Should manage memory`, async () => {
    const storage = new XyoInMemoryStorageProvider();
    const value = Buffer.from(`hotdog`);
    const result1 = await storage.write(Buffer.from(`key`), value, XyoStoragePriority.PRIORITY_LOW, true, 1000);
    expect(result1).toBe(undefined);

    const result2 = await storage.read(Buffer.from(`key`), 1000);
    expect(result2).toBe(value);

    const result3 = await storage.containsKey(Buffer.from(`key`));
    expect(result3).toBe(true);

    const result4 = await storage.containsKey(Buffer.from(`not-key`));
    expect(result4).toBe(false);

    const result7 = await storage.delete(Buffer.from(`key`));
    expect(result7).toBe(result7);
  });
});
