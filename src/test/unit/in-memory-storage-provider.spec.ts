/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 17th August 2018 4:41:28 pm
 * @Email:  developer@xyfindables.com
 * @Filename: in-memory-storage-provider.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 28th August 2018 9:58:20 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { InMemoryStorageProvider } from '../../components/in-memory.storage-provider.impl';

describe('Storage', () => {
  it(`Should manage memory`, async () => {
    const storage = new InMemoryStorageProvider();
    const value = Buffer.from(`hotdog`);
    const result1 = await storage.put(Buffer.from(`key`), value);
    expect(result1).toBe(true);

    const result2 = await storage.get(Buffer.from(`key`));
    expect(result2).toBe(value);

    const result3 = await storage.containsKey(Buffer.from(`key`));
    expect(result3).toBe(true);

    const result4 = await storage.containsKey(Buffer.from(`not-key`));
    expect(result4).toBe(false);

    const result5 = await storage.containsValue(value);
    expect(result5).toBe(true);

    const result6 = await storage.containsValue(Buffer.from('not-hotdog'));
    expect(result6).toBe(false);

    const result7 = await storage.remove(Buffer.from(`key`));
    expect(result7).toBe(result7);

    const result8 = await storage.containsValue(value);
    expect(result8).toBe(false);
  });
});
