/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 31st January 2019 4:42:52 pm
 * @Email:  developer@xyfindables.com
 * @Filename: create-package.js
 * @Last modified by: ryanxyo
 * @Last modified time: Thursday, 31st January 2019 5:39:47 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

const {
  prompt,
  logInfo,
  shelljs,
  logError,
  folderExists,
  exitWithCode,
  sleepSync
} = require('./script-utils')

const path = require('path')

async function getPackageName() {
  const { packageName } = await prompt({type: 'input', message: 'What would you like to name your package?', name: 'packageName'})
  const relativePackageCandidate = path.join('packages', packageName)

  if (folderExists(relativePackageCandidate)) {
    const { tryAgain } = await prompt({
      type: 'confirm',
      message: `Package "${packageName}" already exists. Would you like to try another package name?`,
      name: 'tryAgain'
    })

    if (!tryAgain) {
      return undefined
    }

    sleepSync(1)
    return getPackageName()
  }

  return packageName
}

async function main() {
  const context = {}
  const packageName = await getPackageName(context)
  if (!packageName) {
    return exitWithCode(1, 'Can not create package without name. Will exit')
  }

  logInfo(`Creating package with name ${packageName}`)

  const version = JSON.parse(shelljs.cat('lerna.json').stdout).version
  const user = shelljs.exec('git config user.name').stdout
  const { packageDescription } = await prompt({type: 'input', message: 'Please provider a short description for the package', name: 'packageDescription'})

  shelljs.pushd('packages')
  shelljs.mkdir(packageName)
  shelljs.pushd(packageName)
  shelljs.mkdir('-p', 'src/@types')
  shelljs.touch('src/index.ts')
  shelljs.touch('src/@types/index.ts')

  const packageJSON = 
`{
  "name": "@xyo-network/${packageName}",
  "version": "${version}",
  "description": "${packageDescription}",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "author": "${user.trim()}",
  "license": "MIT",

  "dependencies": {
  },
  "devDependencies": {
    "@types/jest": "^23.3.1",
    "@types/node": "^10.7.1",
    "jest": "^23.6.0",
    "ts-jest": "^23.10.5",
    "ts-node": "^7.0.1",
    "tslint": "^5.12.1",
    "typescript": "^3.2.2"
  }
}`

  shelljs.exec(`echo '${packageJSON}' > package.json`)

  const readme = 
`
[logo]: https://www.xy.company/img/home/logo_xy.png

![logo]

# ${packageName.charAt(0).toUpperCase()}${packageName.substring(1)}

${packageDescription}

## Install

Using yarn

\`\`\`sh
  yarn add @xyo-network/${packageName}
\`\`\`

Using npm

\`\`\`sh
  npm install @xyo-network/${packageName} --save
\`\`\``

  shelljs.exec(`echo '${readme}' > README.md`)

  const tsConfig = 
`{
  "compilerOptions": {
      "target": "es6",
      "module": "commonjs",
      "lib": ["esnext"],
      "declaration": true,
      "declarationMap": true,
      "sourceMap": true,
      "strict": true,
      "composite": true,
      "esModuleInterop": true,
      "noImplicitAny": true,
      "moduleResolution": "node",
      "outDir": "dist",
      "rootDir": "src"
  },
  "exclude": [
    "node_modules",
    "src/**/test/*",
    "src/**/spec",
    "src/**/*.spec.ts"
  ],
  "include": ["src/**/*"],
  "references": []
}`

  shelljs.exec(`echo '${tsConfig}' > tsconfig.json`)
  shelljs.popd()
  const tsconfig = JSON.parse(shelljs.cat('tsconfig.json').stdout)
  tsconfig.references.push({path: packageName})
  tsconfig.include.push(`${packageName}/src/**/*.ts`)
  shelljs.exec(`echo '${JSON.stringify(tsconfig, null, 2)}' > tsconfig.json`)

  logInfo(`Created package with name ${packageName}`)
}

if (require.main === module) {
  main()
}