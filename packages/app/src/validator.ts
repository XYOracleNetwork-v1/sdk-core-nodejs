/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 15th February 2019 11:31:50 am
 * @Email:  developer@xyfindables.com
 * @Filename: validator.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 15th February 2019 5:37:51 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import Joi from 'joi'
import path from 'path'
import { fileExists } from '@xyo-network/utils'
import { IAppConfig } from './@types'

function validateAgainstSchema<T>(val: T, schema: Joi.Schema) {
  const result = Joi.validate<T>(val, schema)
  if (result.error === null) {
    return {
      validates: true
    }
  }

  return {
    validates: false,
    message: result.error.message
  }
}

export async function validateNodeName(nodeName: string): Promise<IValidationResult> {
  const schema = Joi.string().alphanum().min(5).max(15).required()
  return validateAgainstSchema<string>(nodeName, schema)
}

export async function validateIpAddress(ip: string): Promise<IValidationResult> {
  const schema = Joi.string()
    .regex(/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)
    .required()
  return validateAgainstSchema<string>(ip, schema)
}

export async function validateDataPath(dataPath: string): Promise<IValidationResult> {
  try {
    const parts = path.parse(dataPath)
    const parentFolderExists = await fileExists(parts.dir)
    if (parentFolderExists) {
      return {
        validates: true
      }
    }

    return {
      validates: false,
      message: 'The parent folder does not exist'
    }
  } catch (err) {
    return {
      validates: false,
      message: (err as Error).message
    }
  }
}

export async function validatePort(val: string) {
  try {
    const v = parseInt(val, 10)
    const schema = Joi.number().integer().min(1).max(65535).required()
    return validateAgainstSchema<number>(v, schema)
  } catch (err) {
    return {
      validates: false,
      message: (err as Error).message
    }
  }
}

export async function validateURL(url: string) {
  try {
    const schema = Joi.string().required().uri()
    return validateAgainstSchema<string>(url, schema)
  } catch (err) {
    return {
      validates: false,
      message: (err as Error).message
    }
  }
}

export async function validateHexString(hexString: string) {
  try {
    if (!hexString.startsWith('0x')) {
      return {
        validates: false,
        message: 'Must start with 0x'
      }
    }

    const schema = Joi.string().min(1).required().hex()
    return validateAgainstSchema<string>(hexString.substring(2), schema)
  } catch (err) {
    return {
      validates: false,
      message: (err as Error).message
    }
  }
}

export async function validateConfigFile(config: IAppConfig): Promise<IValidationResult> {
  return {
    validates: true
  }
}

export interface IValidationResult {
  validates: boolean,
  message?: string
}
