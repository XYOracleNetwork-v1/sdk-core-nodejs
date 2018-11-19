/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 17th August 2018 9:47:56 am
 * @Email:  developer@xyfindables.com
 * @Filename: jest.config.js
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 19th November 2018 12:09:45 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

module.exports = {
  globals: {
    "ts-jest": {
      tsConfig: "./packages/tsconfig.json"
    }
  },
  moduleFileExtensions: ["ts", "js"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  testMatch: ["**/spec/**/*.spec.(ts)"],
  testEnvironment: "node"
};
