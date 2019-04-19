/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Friday, 1st February 2019 1:58:31 pm
 * @Email:  developer@xyfindables.com
 * @Filename: pay-on-delivery.js
 
 * @Last modified time: Tuesday, 5th February 2019 10:33:36 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

/**
 * An interactive script to interact with the payondelivery contract
 */

const { 
  prompt,
  shelljs,
  logInfo,
  logError,
  exitWithCode,
  exitItDockerNotInstalled,
  getDockerData,
  restartDockerContainer,
  destroyContainer,
  sleepSync,
  folderExists,
  fileExists
} = require('./script-utils')

const Web3 = require('web3')
const { HttpProvider } = require('web3-providers')

async function main () {
  if (folderExists('payondelivery')) {
    const { deleteExistingPayOnDelivery } = await prompt({
      type: 'confirm',
      message: 'The `payondelivery` folder already exists, do you want to delete it?',
      name: 'deleteExistingPayOnDelivery'
    })

    if (deleteExistingPayOnDelivery) {
      shelljs.rm('-rf', 'payondelivery')
      shelljs.exec('git clone https://github.com/XYOracleNetwork/demo-payondelivery-solidity.git payondelivery')
    } else {
      if (folderExists('payondelivery/build/contracts/PayOnDelivery.json')) {
        const networks = await getCurrentPayOnDeliveryDeployments()
        if (networks) {
          const deployments = Object.keys(networks)
          if (deployments.length > 0) {
            return exitWithCode(1, `PayOnDelivery has already been deployed @ ${networks[deployments[0]].address}`)
          }
        }
      }
    }
  } else {
    logInfo(`Installing payondelivery project`)
    shelljs.exec('git clone https://github.com/XYOracleNetwork/demo-payondelivery-solidity.git payondelivery')    
  }

  logInfo(`Building payondelivery project`)
  shelljs.pushd('payondelivery')
  shelljs.exec('yarn')
  shelljs.exec('yarn global add tool-dapploy-nodejs')

  logInfo(`Deploying PayOnDelivery Contract and copying contracts to ipfs`)  
  shelljs.exec('dapploy')
  shelljs.cp('-r', 'build/contracts ../ipfs/staging')
  const addToIPFS = shelljs.exec('docker exec ipfs_host ipfs add -r /export/contracts')
  logInfo(addToIPFS.stdout)
  shelljs.popd()
  const networkDeployments = await getCurrentPayOnDeliveryDeployments()
  if (!networkDeployments) {
    return exitWithCode(1, 'Something went wrong during deployment of contracts')
  }

  logInfo(`Current PaymentOnDelivery Contract address ${Object.values(networkDeployments)[0].address}`)
  exitWithCode(0)
}

async function getCurrentPayOnDeliveryDeployments() {
  if (fileExists('payondelivery/build/contracts/PayOnDelivery.json')) {
    const payOnDeliveryJSON = JSON.parse(shelljs.cat('payondelivery/build/contracts/PayOnDelivery.json').stdout)
    if (payOnDeliveryJSON.networks) {
      return payOnDeliveryJSON.networks
    }

  }

  return undefined
}

if (require.main === module) {
  main()
}