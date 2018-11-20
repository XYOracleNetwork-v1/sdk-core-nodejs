/// <reference types="node" />
export interface IXyoHash {
    getHash(): Buffer;
    verifyHash(data: Buffer): Promise<boolean>;
}
export interface IXyoHashProvider {
    /**
     * Creates a hash for a particular piece of data.
     * Returns an instance of an XyoHash asynchronously
     */
    createHash(data: Buffer): Promise<IXyoHash>;
    /**
     * Given a raw piece of data and the raw hash, will return
     * a boolean value asynchronously as to whether the hash
     * corresponds to the data for this hash-provider
     */
    verifyHash(data: Buffer, hash: Buffer): Promise<boolean>;
}
//# sourceMappingURL=index.d.ts.map