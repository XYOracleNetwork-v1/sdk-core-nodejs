/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Thursday, 31st January 2019 1:16:05 pm
 * @Email:  developer@xyfindables.com
 * @Filename: manage-ipfs.js
 
 * @Last modified time: Friday, 1st February 2019 12:35:17 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

/**
 * An interactive script to start a ipfs docker service
 */

const { 
  prompt,
  shelljs,
  logInfo,
  fileOrFolderExists,
  logError,
  exitWithCode,
  exitItDockerNotInstalled,
  getDockerData,
  restartDockerContainer,
  destroyContainer,
  sleepSync
} = require('./script-utils')

const path = require('path')

async function main(args) {
  // Make sure docker is installed
  exitItDockerNotInstalled()

  // Run `docker ps -a` to see what containers exist
  const ipfsDockerData = getDockerData('ipfs_host')

  // Will return exit code non-zero if container doesn't exist
  const existingIpfsContainer = ipfsDockerData !== undefined

  // If no ipfs_host exists, create one
  if (!existingIpfsContainer) {
    logInfo(`No existing docker container found with name ipfs_host`)
    const successfullyStarted = await tryStartIpfsService(true)
    return exitWithCode(successfullyStarted ? 0 : 1)
  }

  // ipfs_host exists, ask user how they want take action
  const ipfsIsUp = ipfsDockerData[0].State.Running
  const ipfsStatus = ipfsIsUp ? 'Running' : 'Stopped'
  logInfo(`Existing ipfs_host container found. Status: ${ipfsStatus}`)

  let { ipfsAction } = await prompt({
    type: 'select',
    name: 'ipfsAction',
    message: 'What would you like to do with the existing ipfs service?',
    choices: [
      'Restart the existing service',
      'Kill it and start a new one',
      'No action'
    ]
  })

  switch (ipfsAction)  {
    case 'Restart the existing service':
      const successRestartIpfs = restartDockerContainer('ipfs_host')
      if (!successRestartIpfs) {
        return exitWithCode(1, 'There was an error restarting ipfs_host')
      }


      return exitWithCode(0, `Successfully restarted ipfs_host service`)

    case 'Kill it and start a new one':
      destroyContainer('ipfs_host')
      const successfullyStarted = await tryStartIpfsService(false)
      return exitWithCode(successfullyStarted ? 0 : 1)

    case 'No action':
      return exitWithCode(0, 'Exiting with No action taken on ipfs_host')

    default:
      return exitWithCode(1, `Impossible state. Will exit`)
  }
}

async function tryStartIpfsService(restartWithCorsConfig) {
  const ipfsFolderExists = fileOrFolderExists('ipfs')
  if (ipfsFolderExists) {
    const { deleteIpfsAction } = await prompt({
      type: 'confirm',
      message: 'An ipfs already folder already exists. Do you want to delete it?',
      name: 'deleteIpfsAction',
    })

    if (deleteIpfsAction) {
      logInfo('Deleting Existing ipfs directory')
      shelljs.rm('-rf', 'ipfs')
      shelljs.mkdir('ipfs')
    }
  } else {
    shelljs.mkdir('ipfs')    
  }

  shelljs.pushd('ipfs')
  shelljs.mkdir('data')
  shelljs.mkdir('staging')

  const absoluteIPFSPath = shelljs.pwd().stdout
  const ipfsDataPath = path.join(absoluteIPFSPath, 'data')
  const ipfsStagingPath = path.join(absoluteIPFSPath, 'staging')
  
  shelljs.exec(`
    docker run \
    -d \
    --name ipfs_host \
    -v ${ipfsStagingPath}:/export \
    -v ${ipfsDataPath}:/data/ipfs \
    -p 4001:4001 \
    -p 127.0.0.1:8080:8080 \
    -p 127.0.0.1:5001:5001 \
    ipfs/go-ipfs:latest  
  `)

  sleepSync(5) // wait for it to come up
  if (restartWithCorsConfig) {
    shelljs.exec(`docker exec ipfs_host ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'`)
    shelljs.exec(`docker exec ipfs_host ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST"]'`)
    restartDockerContainer('ipfs_host')
  }

  logInfo(`Successfully started ipfs service`)

  return true
}

async function addFileToIPFS(pathToFileOrFolder) {
  const p = path.resolve(pathToFileOrFolder)
  const exists = fileOrFolderExists(p)
  if (!exists) {
    exitWithCode(1, `${p} does not exist`)
  }

  const dest = path.join(process.cwd(), 'ipfs', 'staging')
  shelljs.cp('-R', p, dest)
  shelljs.exec(`docker exec ipfs_host ipfs add -r /export/${path.basename(p)}`, {silent: false})
}

if (require.main === module) {
  if (process.argv.length > 2) {
    switch (process.argv[2]) {
      case 'add':
        if (process.argv.length > 3) {
          return addFileToIPFS(process.argv[3])
        }
      default: throw new Error(`No sub-commands specified for value ${process.argv[2]}`) 
    }
  }

  main(process.argv)
} 