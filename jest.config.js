/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 17th August 2018 9:47:56 am
 * @Email:  developer@xyfindables.com
 * @Filename: jest.config.js
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 2nd October 2018 3:53:55 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

module.exports = {
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.json"
    }
  },
  moduleFileExtensions: ["ts", "js"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  testMatch: ["**/test/**/*.spec.(ts)"],
  testEnvironment: "node"
};
