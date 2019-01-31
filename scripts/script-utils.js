/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 31st January 2019 10:24:18 am
 * @Email:  developer@xyfindables.com
 * @Filename: script-utils.js
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 31st January 2019 2:33:40 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

const { prompt } = require('enquirer');
const shelljs = require('shelljs')
shelljs.config.silent = true

const logInfo = console.log
const logWarn = console.warn
const logError = console.error

module.exports = {
  prompt,
  shelljs,
  logInfo,
  logWarn,
  logError,

  exitWithCode: (code, message) => {
    if (message) {
      if (code === 0) {
        logInfo(message)
      } else {
        logError(message)
      }
    }

    process.exit(code)
  },

  exitItDockerNotInstalled: () => {
    const whichDocker = shelljs.which('docker').stdout
    if (!whichDocker.trim()) {
      console.error(`Docker uninstalled, will exit.`)
      process.exit(1)
      return
    } 
  },

  // Returns a JSON object if container exists (running or exited), undefined otherwise
  getDockerData: (containerName) => {
    const inspectResult = shelljs.exec(`docker inspect ${containerName}`)
    return inspectResult.code === 0 ? JSON.parse(inspectResult.stdout) : undefined
  },

  // Idempotent kill and rm for a docker-container
  destroyContainer: (containerName) => {
    shelljs.exec(`docker kill ${containerName}`)
    shelljs.exec(`docker rm ${containerName}`)
    return
  },

  restartDockerContainer: (containerName) => {
    const res = shelljs.exec(`docker restart ${containerName}`)
    return res.code === 0
  },

  sleepSync: (seconds) => {
    shelljs.exec(`sleep ${seconds}`)
  },

  fileOrFolderExists: (pathToTest) => {
    return !Boolean(shelljs.exec(`test -e ${pathToTest}`).code) || !Boolean(shelljs.exec(`test -d ${pathToTest}`).code)
  },

  fileExists: (pathToTest) => {
    return !Boolean(shelljs.exec(`test -e ${pathToTest}`).code)
  },

  folderExists: (pathToTest) => {
    return !Boolean(shelljs.exec(`test -d ${pathToTest}`).code)
  }
}