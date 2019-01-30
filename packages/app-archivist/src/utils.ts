/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th December 2018 10:59:20 am
 * @Email:  developer@xyfindables.com
 * @Filename: utils.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 13th December 2018 10:59:27 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { promisify } from "util"
import fs from 'fs'

const mkdir = promisify(fs.mkdir)
const stat = promisify(fs.stat)

export async function createDirectoryIfNotExists(path: string) {
  try {
    await stat(path)
  } catch (err) {
    if (err.code && err.code === 'ENOENT') {
      await mkdir(path, null)
    }
  }
}
