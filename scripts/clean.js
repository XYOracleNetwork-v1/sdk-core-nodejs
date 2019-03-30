/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 11th December 2018 2:11:17 pm
 * @Email:  developer@xyfindables.com
 * @Filename: clean.js
 * @Last modified by: ryanxyo
 * @Last modified time: Wednesday, 12th December 2018 2:00:38 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

const fs = require('fs')
const path = require('path')
const workingDirectory = process.cwd()
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const packagesPath = path.join(workingDirectory, 'packages')
const projectTsConfig = require('../packages/tsconfig.json')

Promise.all(
  projectTsConfig.references.map(async (reference) => {
    const referencePath = reference.path
    await deleteFolderRecursive(path.join(packagesPath, referencePath, 'node_modules'))
    await deleteFolderRecursive(path.join(packagesPath, referencePath, 'dist'))
    await deleteFolderRecursive(path.join(packagesPath, referencePath, 'coverage'))
  })
)
.then(() => {
  return Promise.all([
    deleteFolderRecursive(path.join(packagesPath, 'dist')),
    deleteFolderRecursive(path.join(workingDirectory, 'node_modules')),
    deleteFolderRecursive(path.join(workingDirectory, 'coverage'))
  ])
})


async function deleteFolderRecursive(path) {
  if (fs.existsSync(path)) {
    const { stdout, stderr } = await exec(`rm -rf ${path}`);
  }
};