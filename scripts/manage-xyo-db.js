/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 30th January 2019 1:54:36 pm
 * @Email:  developer@xyfindables.com
 * @Filename: create-xyo-db.js
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 5th February 2019 11:14:02 am
 * @License: All Rights Reserved 
 * @Copyright: Copyright XY | The Findables Company
 */


/**
 * An interactive script to manage the XyoDb Docker service
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
  destroyContainer
} = require('./script-utils')

async function main(argv) {
  // Make sure docker is installed
  exitItDockerNotInstalled()
  
  // Run `docker ps -a` to see what containers exist
  const xyoDbDockerData = getDockerData('XyoDb')
  
  // Will return exit code non-zero if container doesn't exist
  const existingXyoDbContainer = xyoDbDockerData !== undefined
  
  // If no XyoDb exists, create one
  if (!existingXyoDbContainer) {
    logInfo(`No existing docker container found with name XyoDb`)    
    const successfullyStarted = await tryStartXyoDbService()
    return exitWithCode(successfullyStarted ? 0 : 1)
  }

  // XyoDb exists, ask user how they want take action
  const xyoDbIsUp = xyoDbDockerData[0].State.Running
  const xyoDbStatus = xyoDbIsUp ? 'Running' : 'Stopped'
  logInfo(`Existing XyoDb container found. Status: ${xyoDbStatus}`)

  let { dbAction } = await prompt({
    type: 'select',
    name: 'dbAction',
    message: 'What would you like to do with the existing XyoDb service?',
    choices: [
      'Restart the existing database',
      'Kill it and start a new one',
      'No action'
    ]
  })
  
  switch (dbAction)  {
    case 'Restart the existing database':
      const successRestartDb = restartDockerContainer('XyoDb')
      if (!successRestartDb) {
        return exitWithCode(1, 'There was an error restarting XyoDb')
      }

      return exitWithCode(0, 'Successfully restarted XyoDb service. SQL credentials unknown. Will exit')

    case 'Kill it and start a new one':
      destroyContainer('XyoDb')
      const successfullyStarted = await tryStartXyoDbService()
      return exitWithCode(successfullyStarted ? 0 : 1)

    case 'No action':
      return exitWithCode(0, 'Exiting with No action taken on XyoDb')

    default:
      return exitWithCode(1, `Impossible state. Will exit`)    
  }
  
}

async function collectionUsernameAndPassword() {
  let { username } = await prompt({type: 'input', initial: 'admin', name: 'username', message: 'Enter a username for the sql database'})
  let { password } = await prompt({type: 'input', initial: 'password', name: 'password', message: 'Enter a password for the sql database'})  
  return {username, password}
}

async function tryStartXyoDbService() {
  const {username, password } = await collectionUsernameAndPassword()
  logInfo(`\nStarting MySQL service with credentials:\n\tUsername: ${username}\n\tpassword: ${password}`)
  
  const startSqlRes = shelljs.exec(`
    docker run \
    --name XyoDb \
    -d \
    -p 3306:3306 \
    -e MYSQL_USER=${username} \
    -e MYSQL_PASSWORD=${password} \
    -e MYSQL_DATABASE=Xyo \
    -e MYSQL_RANDOM_ROOT_PASSWORD=yes \
    mysql:5.7.24 --sql_mode=NO_ENGINE_SUBSTITUTION  
  `)

  if (startSqlRes.code !== 0) {
    logError(`There was an error starting the MySQL service. Exit Code ${startSqlRes.code}.\nError Message:${startSqlRes.stderr}`)
    return false
  } else {
    logInfo(`\nSuccessfully started a MySQL service @ 127.0.0.1:3306\n\n`)
    logInfo(`You can paste the command below into your shell to set up your development environments:\n`)
    logInfo(`----------------------------------------------------------------------------------------------------------------------------------------\n`)
    logInfo(`export SQL__HOST=127.0.0.1 export SQL__USER=${username} export SQL__PASSWORD=${password} export SQL__DATABASE=Xyo export SQL__PORT=3306`)
    logInfo(`\n----------------------------------------------------------------------------------------------------------------------------------------\n`)
    return true
  }
}

module.exports = { main }

/** If this is the main program, execute it */
if (require.main === module) main(process.argv)