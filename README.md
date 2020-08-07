[![logo]](https://xyo.network)

# sdk-core-nodejs

[![NPM](https://img.shields.io/npm/v/@xyo-network/sdk-core-nodejs.svg?style=plastic)](https://www.npmjs.com/package/@xyo-network/sdk-core-nodejs)

![](https://github.com/XYOracleNetwork/sdk-core-nodejs/workflows/Build/badge.svg?branch=develop) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/c0f40ecdba874362a2f212b032df8d86)](https://www.codacy.com/gh/XYOracleNetwork/sdk-core-nodejs?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=XYOracleNetwork/sdk-core-nodejs&amp;utm_campaign=Badge_Grade) [![Maintainability](https://api.codeclimate.com/v1/badges/f3dd4f4d35e1bd9eeabc/maintainability)](https://codeclimate.com/github/XYOracleNetwork/sdk-core-nodejs/maintainability) [![BCH compliance](https://bettercodehub.com/edge/badge/XYOracleNetwork/sdk-core-nodejs?branch=master)](https://bettercodehub.com/) [![Sonarcloud Status](https://sonarcloud.io/api/project_badges/measure?project=XYOracleNetwork_sdk-core-nodejs&metric=alert_status)](https://sonarcloud.io/dashboard?id=XYOracleNetwork_sdk-core-nodejs) 
[![Known Vulnerabilities](https://snyk.io/test/github/XYOracleNetwork/sdk-core-nodejs/badge.svg?targetFile=package.json)](https://snyk.io/test/github/XYOracleNetwork/sdk-core-nodejs?targetFile=package.json)

> The XYO Foundation provides this source code available in our efforts to advance the understanding of the XYO Procotol and its possible uses. We continue to maintain this software in the interest of developer education. Usage of this source code is not intended for production.

## Table of Contents

-   [Title](#sdk-core-nodejs)
-   [Project Overview](#project-overview)
-   [Scope of Features](#scope-of-features)
-   [Yellow Paper](#yellow-paper)
-   [Architecture and Design](#architecture-and-design)
-   [Getting Started](#getting-started)
-   [Developer Guide](#developer-guide)
-   [Maintainers](#maintainers)
-   [License](#license)
-   [Credits](#credits)

## Project Overview

### Scope of features

Core functionality for the XYO NodeJS projects. This repository implements
the core objects and services used in the XYO protocol. Additionally it provides core XYO features like performing bound-witnesses, hashing, signing, serialization, origin-chain management and TCP Network services. Alas, it exposes a number of CLI applications for running archivists and diviners.

### Yellow Paper

The XYO protocol for creating origin-blocks is specified in the [XYO Yellow Paper](https://docs.xyo.network/XYO-Yellow-Paper.pdf). In it, it describes the behavior of how a node on the XYO network should create bound-witnesses. Note, the behavior is not coupled with any particular technology constraints around transport layers, cryptographic algorithms, or hashing algorithms.

### Architecture and Design

As such, the design of the system is aimed at abstracting these concepts
so that the concrete implementations of these components can be swapped out so long as they conform to the correct interfaces.

Practically, this library uses TypeScript, which transpiles to JavaScript. Additionally, a TCP network provider has been implemented. Furthermore, some of the most popular public-key cryptography algorithms and hashing algorithms have been wrapped and made available to the core library. If you're favorite crypto signing algorithm is not yet supported, we welcome pull-requests and suggestions.

[Here](https://github.com/XYOracleNetwork/spec-coreobjectmodel-tex) is a link to the core object model that contains an index of major/minor values and their respective objects.

> If you are looking to create an XYO Node using a CLI, this is not the library you should refer to, please go to our [app-xyo-nodejs repo here](https://github.com/XYOracleNetwork/app-xyo-nodejs). This library provides core nodejs components for XYO Protocol functions, but it itself does not generate nodes for the Archivist or Diviner. 

## Getting started

If you intend yo bypass the node XYO app and integrate these core components into your app.

### Install as a dependency

We prefer `yarn`, but feel free to use either `npm` or `yarn`

`yarn`

```bash
  yarn add @xyo-network/sdk-core-nodejs
```

`npm`

```bash
  npm install @xyo-network/sdk-core-nodejs
```

Then based on how you have set up your project, import the components you are looking for, an example:

```javascript
  import { XyoOriginState } from '@xyo-network/sdk-core-nodejs'
```

Or multiple components

```javascript
  import {
  XyoOriginState,
  XyoFileOriginStateRepository
} from '@xyo-network/sdk-core-nodejs'

```


## Developer Guide

Developers should conform to git flow workflow. Additionally, we should try to make sure
every commit builds. Commit messages should be meaningful serve as a meta history for the
repository. Please squash meaningless commits before submitting a pull-request.

To contribute and test, the current workflow would be to use the XYO App SDK nodejs, see which methods may be failing, and then clone and test this core library. 

### Clone repository

```sh
git clone https://github.com/XYOracleNetwork/sdk-core-nodejs
```

### Install dependencies

After cloning the repository, change directory to the folder that houses the repository.

```sh
  cd sdk-core-nodejs
```

You will have to run Lerna to setup the links

```sh
  yarn install 
```

### Build

Once the dependencies are installed run

```sh
  yarn build
```

### Testing

#### Run all tests

```sh
  yarn test
```


There is git hook on commits to validate the project builds. If you'd like to commit your changes
while developing locally and want to skip this step you can use the `--no-verify` commit option.

i.e.

```sh
  git commit --no-verify -m "COMMIT MSG"
```

### Development Tools

#### NVM (Node Version Manager)

A number of the libraries that this project depends on may fail at install-time because they need to be built from C++ source where the output is specific to the host system. The underlying issue is that it is trying to modify files in protected areas of the file-system.

This is all to say that [nvm](https://github.com/creationix/nvm) is strongly recommended for developers. Additionally you will find a [.nvmrc file](.nvmrc) at the root-level of the project that specifies the currently supported version of Node.

#### Workflow

The project structure was designed to support and encourage a modular architecture. This project uses a typical [Lerna](https://lernajs.io/) layout. That is, all modules are located in the [packages folder](packages). This allows for a couple of things that are conducive to an efficient development and release process:

-   Local linking of modules during development
-   Ability to release patches, minor, and major version upgrades to npm with ease
-   TypeScript linking using [project references](https://www.typescriptlang.org/docs/handbook/project-references.html)

That said, since this is a TypeScript project, the source must be transpiled to JavaScript before execution. So, if a change is made to one or more modules in the package directory `yarn build` must be run from the project root for the changes to reflect.

So a typical workflow might look like this:

-   Developer pulls down repository and changes directory in project root
-   Developer runs `yarn install` to install all dependencies of all the packages in accordance with [yarn workspace feature](https://yarnpkg.com/lang/en/docs/workspaces/)
-   Developer runs `yarn build` to transpile TypeScript source to JavaScript
-   Developer makes changes in one or more packages
-   Developer runs `yarn build` to see those changes reflected and linked accordingly
-   On occasion, running `yarn clean` may prove useful for resetting the project to clean state
-   When a change-set is complete and has gone through the proper code-review etc, a release can be made running `yarn release`. Release versions should follow [SemVer](https://semver.org/) standards.

##### Set the first account in ganache as environment variable for config

```sh
  eval `./scripts/manage-ganache.js set-account`
```

## Maintainers

-   Carter Harrison
-   Arie Trouw
-   Kevin Weiler 
-   Phillip Lorenzo

## License

See the [LICENSE](LICENSE) file for license details.

## Credits

Made with 🔥and ❄️ by [XYO](https://www.xyo.network)

[logo]: https://cdn.xy.company/img/brand/XYO_full_colored.png
