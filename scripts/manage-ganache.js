/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 31st January 2019 10:23:51 am
 * @Email:  developer@xyfindables.com
 * @Filename: manage-ganache.js
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 31st January 2019 2:32:41 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

/**
 * An interactive script to start a ganache docker service
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
  sleepSync
} = require('./script-utils')

const Web3 = require('web3')
const { HttpProvider } = require('web3-providers')

async function main() {
  // Make sure docker is installed
  exitItDockerNotInstalled()

  // Run `docker ps -a` to see what containers exist
  const ganacheDockerData = getDockerData('ganache')
  
  // Will return exit code non-zero if container doesn't exist
  const existingGanacheContainer = ganacheDockerData !== undefined

  // If no ganache exists, create one
  if (!existingGanacheContainer) {
    logInfo(`No existing docker container found with name ganache`)
    const successfullyStarted = await tryStartGanacheService()
    return exitWithCode(successfullyStarted ? 0 : 1)
  }

  // ganache exists, ask user how they want take action
  const ganacheIsUp = ganacheDockerData[0].State.Running
  const ganacheStatus = ganacheIsUp ? 'Running' : 'Stopped'
  logInfo(`Existing ganache container found. Status: ${ganacheStatus}`)  

  let { ganacheAction } = await prompt({
    type: 'select',
    name: 'ganacheAction',
    message: 'What would you like to do with the existing ganache service?',
    choices: [
      'Restart the existing service',
      'Kill it and start a new one',
      'No action'
    ]
  })
  
  switch (ganacheAction)  {
    case 'Restart the existing service':
      const successRestartGanache = restartDockerContainer('ganache')
      if (!successRestartGanache) {
        return exitWithCode(1, 'There was an error restarting ganache')
      }

      while (true) {
        const mnemonic = shelljs.exec(`docker logs ganache | grep Mnemonic`)
        const indexOfMnemonic = mnemonic.stdout.indexOf('Mnemonic:')
        if (indexOfMnemonic >= 0) {
          const mn = mnemonic.stdout.split('Mnemonic:').filter(i => i)[0].trim()
          return exitWithCode(0, `Successfully restarted ganache service with mnemonic:\n\n\t${mn}\n\nWill exit`)
        }
      }

    case 'Kill it and start a new one':
      destroyContainer('ganache')
      const successfullyStarted = await tryStartGanacheService()
      return exitWithCode(successfullyStarted ? 0 : 1)

    case 'No action':
      return exitWithCode(0, 'Exiting with No action taken on ganache')

    default:
      return exitWithCode(1, `Impossible state. Will exit`)
  }
}

async function collectMnemonic() {
  const defaultMnemonic = 'better despair fever little brisk wine office oyster urge lake reduce grape'
  let { mnemonic } = await prompt({type: 'input', name: 'mnemonic', message: 'Enter a 12 word mnemonic', initial: defaultMnemonic})
  return mnemonic
}

async function tryStartGanacheService() {
  const mnemonic = await collectMnemonic()
  logInfo(`\nStarting Ganache service with mnemonic:\n\n\t${mnemonic}\n\n`)
  
  const startGanacheRes = shelljs.exec(`
    docker run \
    --name ganache \
    -d \
    trufflesuite/ganache-cli:latest -m "${mnemonic}"
  `)

  if (startGanacheRes.code !== 0) {
    logError(`There was an error starting the Ganache service. Exit Code ${startGanacheRes.code}.\nError Message:${startGanacheRes.stderr}`)
    return false
  } else {
    while (true) {
      const res = shelljs.exec(`docker logs ganache | head -n 42`)
      const finished = res.stdout.indexOf('Listening on') !== -1
      if (finished) {
        logInfo(res.stdout)
        break
      }

      sleepSync(1)
    }

    logInfo('\n\nWill Exit')

    return true
    
  }
}

async function balances() {
  var web3 = new Web3(new HttpProvider('http://0.0.0.0:8545'))
  const accounts = await web3.eth.getAccounts(a => b = a).then(r => res = r)
  const balances = await Promise.all(accounts.map(async (a) => {
    const balanceWei = await web3.eth.getBalance('0x889EF607000a8C521fc7413118bF6E9E7442D907')
    return { account: a, balance: web3.utils.fromWei(balanceWei)}
  }))

  logInfo('\n=====================================================')
  logInfo('Balances')
  logInfo('=====================================================')
  balances.forEach(({account, balance}) => logInfo(`${account}\t${balance}`))
  logInfo('=====================================================\n')
}

module.exports = { main }

/** If this is the main program, execute it */
if (require.main === module) {
  if (process.argv.length > 2) {
    switch (process.argv[2]) {
      case 'balances':
        return balances()
      default: throw new Error('No sub-commands specified') 
    }
  }

  main(process.argv)
} 