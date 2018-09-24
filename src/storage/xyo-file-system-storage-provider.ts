/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 12th September 2018 9:18:47 am
 * @Email:  developer@xyfindables.com
 * @Filename: file-system.storage.provider.impl.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 24th September 2018 2:57:45 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XYOStorageProvider, XyoStorageProviderPriority } from './xyo-storage-provider';
import fs from 'fs';
import { XyoError } from '../components/xyo-error';
import path from 'path';

/**
 * A storage provider implemented on top of the file system
 */

export class XyoFileSystemStorageProvider implements XYOStorageProvider {

  /**
   * Creates a new instance of a `FileSystemStorageProvider`. The dataFolder provided
   * will be used to encapsulate all the data.
   *
   * The constructor synchronously verifies the folder already exists
   *
   * @param dataFolder A pre-existing data-folder to store the data in
   * @throws Will throw an `XyoError` if the folder does not exist
   */

  constructor(private readonly dataFolder: string, private readonly fileNameEncoding: 'hex' | 'utf8') {
    try {
      fs.readdirSync(dataFolder);
    } catch (e) {
      throw new XyoError(`Data folder ${dataFolder} does not exist`, XyoError.errorType.ERR_CRITICAL);
    }
  }

  /**
   * Attempts to write a key/value pair to storage
   *
   * @param key The key, or name, of the value
   * @param value The value to store
   * @param priority @NOT_IMPLEMENTED
   * @param cache @NOT_IMPLEMENTED
   * @param timeout @NOT_IMPLEMENTED
   * @returns Returns async undefined if success, throws an error if it could not be written.
   */

  public write(
    key: Buffer,
    value: Buffer,
    priority: XyoStorageProviderPriority,
    cache: boolean,
    timeout: number
  ): Promise<XyoError | undefined> {
    return new Promise((resolve, reject) => {
      fs.writeFile(path.join(this.dataFolder, key.toString(this.fileNameEncoding)), value, (err) => {
        if (err) {
          const e = new XyoError(`Could not save file: ${err.message}`, XyoError.errorType.ERR_CRITICAL, err);
          return reject(e);
        }

        return resolve(undefined);
      });
    });
  }

  /**
   * Attempts to read a value corresponding to the key.
   *
   * @param key The key to fetch
   * @param timeout @NOT_IMPLEMENTED
   * @returns The value if it exists, otherwise throws an error if it does not exist
   */

  public read(key: Buffer, timeout: number): Promise<Buffer | undefined> {
    return new Promise((resolve, reject) => {
      fs.readFile(path.join(this.dataFolder, key.toString(this.fileNameEncoding)), (err, data) => {
        if (err) {
          const e = new XyoError(`Could not read file: ${err.message}`, XyoError.errorType.ERR_CRITICAL, err);
          return reject(e);
        }

        return resolve(data);
      });
    });
  }

  /**
   * @returns Returns a list corresponding to all the keys in storage
   */

  public getAllKeys(): Promise<Buffer[]> {
    return new Promise((resolve, reject) => {
      fs.readdir(this.dataFolder, (err, files) => {
        if (err) {
          const e = new XyoError(`Could not read data folder: ${err.message}`, XyoError.errorType.ERR_CRITICAL, err);
          return reject(e);
        }

        return resolve(files.map(file => Buffer.from(file, this.fileNameEncoding)));
      });
    });
  }

  /**
   * Attempts to delete a key/value pair from storage
   *
   * @param key The key to delete.
   * @throws Will throw an error if the key does not exist
   */

  public delete(key: Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.unlink(path.join(this.dataFolder, key.toString(this.fileNameEncoding)), (err) => {
        if (err) {
          const e = new XyoError(`Could not delete data file: ${err.message}`, XyoError.errorType.ERR_CRITICAL, err);
          return reject(e);
        }

        return resolve();
      });
    });
  }

  /**
   * @param key The key to query
   * @returns Will be return true if the file exists, false otherwise
   */

  public containsKey(key: Buffer): Promise<boolean> {
    return new Promise((resolve, reject) => {
      fs.access(path.join(this.dataFolder, key.toString(this.fileNameEncoding)), fs.constants.F_OK, (err) => {
        return Boolean(err);
      });
    });
  }
}
