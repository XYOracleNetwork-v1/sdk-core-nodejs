/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Monday, 22nd October 2018 4:42:43 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-kvdb.spec.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 22nd October 2018 5:12:25 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoKvDb } from "../xyo-kvdb";
import { XyoBasicKeyValueStorageProvider } from "../../xyo-storage/xyo-basic-key-value-storage-provider";
import { XyoStoragePriority } from "../../xyo-storage/xyo-storage-priority";

describe('key value namespaces', () => {
  it(`Should create a couple of namespaces`, async () => {
    const storageProvider = new XyoBasicKeyValueStorageProvider('./db.json');
    const kvdb = new XyoKvDb(storageProvider);
    const helloRepo = await kvdb.getOrCreateNamespace('hello');
    await helloRepo.write(Buffer.from('a'), Buffer.from('b'), XyoStoragePriority.PRIORITY_HIGH, true, 60000);
  });
});
