[logo]: https://www.xy.company/img/home/logo_xy.png

![logo]

# XYO CORE SDK (sdk-core-nodejs)

[![CircleCI](https://circleci.com/gh/XYOracleNetwork/sdk-core-nodejs.svg?style=svg)](https://circleci.com/gh/XYOracleNetwork/sdk-core-nodejs)
[![Greenkeeper badge](https://badges.greenkeeper.io/XYOracleNetwork/sdk-core-nodejs.svg)](https://greenkeeper.io/)
[![Maintainability](https://api.codeclimate.com/v1/badges/f6bc63330b1d2422973b/maintainability)](https://codeclimate.com/github/XYOracleNetwork/sdk-core-nodejs/maintainability)

Core functionality for the XYO nodejs projects. This repository implements
the core objects used in the XYO protocol. Additionally it provides core
XYO features like performing bound-witnesses, hashing, signing, serialization, origin-chain management and TCP Network services.

The XYO protocol for creating origin-blocks is specified in the [XYO Yellow Paper](https://docs.xyo.network/XYO-Yellow-Paper.pdf).
In it, it describes the behavior of how a node on the XYO network should create
bound-witnesses. Note, the behavior is not coupled with any particular technology constraints around transport layers, cryptographic algorithms, or hashing algorithms.

As such, the design of the system is aimed at abstracting these concepts
so that the concrete implementations of these components can be swapped out so long
as they conform to the correct interfaces.

Practically, this library uses TypeScript, which transpiles to JavaScript. Additionally, a TCP
network provider has been implemented. Furthermore, some of the most popular public-key cryptography
algorithms and hashing algorithms have been wrapped and made available to the core library.
If you're favorite crypto signing algorithm is not yet supported, we welcome pull-requests and suggestions.

[Here](https://github.com/XYOracleNetwork/spec-coreobjectmodel-tex) is a link to the core object model that contains an index of major/minor values and their respective objects.

## Getting started

### Clone repository

```sh
git clone https://github.com/XYOracleNetwork/sdk-core-nodejs
```

### Install dependencies

After cloning the repository, change directory to the folder that houses the repository.

```sh
  cd sdk-core-nodejs
```

Once you've switched to the repository directory, install the dependencies. We prefer `yarn` but `npm` works just as well.

```sh
  yarn install
```

Once the dependencies are installed run

```sh
  yarn build
```

This will transpile the TypeScript into javascript and link the local packages together.

To start a reference implementation of a base-node that can perform bound-witnesses as a server run

```sh
  node packages/base-node
```

This will start a node on port 11000 and accept incoming bound-witness requests

Since this project is meant to function as a library there is no application to be run. There are number of tests that can be run from the command-line using.

```sh
  yarn test
```

Run a set of tests in a particular file:

i.e. Where the test file is `test/integration/lib.spec.ts`

```sh
  NODE_ENV=test && node ./node_modules/jest/bin/jest test/integration/lib.spec.ts
```

## Additional Documentation

- [storage.leveldb](packages/storage.leveldb/README.md)
- [ipfs-client](packages/ipfs-client/README.md)
- [archivist-repository.sql](packages/archivist-repository.sql/README.md)
- [heuristics](packages/heuristics/README.md)
- [peer-interaction-handlers](packages/peer-interaction-handlers/README.md)
- [signing.rsa](packages/signing.rsa/README.md)
- [serializer](packages/serializer/README.md)
- [signing](packages/signing/README.md)
- [logger](packages/logger/README.md)
- [buffer-utils](packages/buffer-utils/README.md)
- [network.tcp](packages/network.tcp/README.md)
- [peer-discovery](packages/peer-discovery/README.md)
- [diviner-archivist-client.graphql](packages/diviner-archivist-client.graphql/README.md)
- [serialization-schema](packages/serialization-schema/README.md)
- [serialization](packages/serialization/README.md)
- [origin-block-repository](packages/origin-block-repository/README.md)
- [ip-service](packages/ip-service/README.md)
- [network](packages/network/README.md)
- [data-generator](packages/data-generator/README.md)
- [heuristics-common](packages/heuristics-common/README.md)
- [api-archivist-graphql](packages/api-archivist-graphql/README.md)
- [hashing](packages/hashing/README.md)
- [storage](packages/storage/README.md)
- [about-me](packages/about-me/README.md)
- [app-diviner](packages/app-diviner/README.md)
- [about-diviner](packages/about-diviner/README.md)
- [archivist-network](packages/archivist-network/README.md)
- [base-node](packages/base-node/README.md)
- [peer-connections](packages/peer-connections/README.md)
- [node-runner](packages/node-runner/README.md)
- [diviner-archivist-client](packages/diviner-archivist-client/README.md)
- [p2p](packages/p2p/README.md)
- [node-network](packages/node-network/README.md)
- [scsc](packages/scsc/README.md)
- [app-archivist](packages/app-archivist/README.md)
- [web3-question-service](packages/web3-question-service/README.md)
- [signing.ecdsa](packages/signing.ecdsa/README.md)
- [errors](packages/errors/README.md)
- [bound-witness](packages/bound-witness/README.md)
- [origin-chain](packages/origin-chain/README.md)
- [meta-list](packages/meta-list/README.md)
- [archivist-repository](packages/archivist-repository/README.md)
- [base](packages/base/README.md)
- [graphql-server](packages/graphql-server/README.md)
- [diviner-graphql-api](packages/diviner-graphql-api/README.md)
- [peer-interaction-router](packages/peer-interaction-router/README.md)
- [questions](packages/questions/README.md)
- [peer-interaction](packages/peer-interaction/README.md)
- [web3-service](packages/web3-service/README.md)

## Developer Guide

Developers should conform to git flow workflow. Additionally, we should try to make sure
every commit builds. Commit messages should be meaningful serve as a meta history for the
repository. Please squash meaningless commits before submitting a pull-request.

There is git hook on commits to validate the project builds. If you'd like to commit your changes
while developing locally and want to skip this step you can use the `--no-verify` commit option.

i.e.

```sh
  git commit --no-verify -m "COMMIT MSG"
```

### Development Tools

#### NVM (Node Version Manager)

A number of the libraries that this project depends on may fail at install-time because they need to be built from C++ source where the output is specific to the host system. The underlying issue is that it is trying to modify files in protected areas of the file-system. This is all to say that [nvm](https://github.com/creationix/nvm) is strongly recommended for developers. Additionally you will find a [.nvmrc file](.nvmrc) at the root-level of the project that specifies the currently supported version of Node.

#### Workflow

The project structure was designed to support and encourage a modular architecture. This project uses a typical [Lerna](https://lernajs.io/) layout. That is, all modules are located in the [packages folder](packages). This allows for a couple of things that are conducive to an efficient development and release process:

- Local linking of modules during development
- Ability to release patches, minor, and major version upgrades to npm with ease
- TypeScript linking using [project references](https://www.typescriptlang.org/docs/handbook/project-references.html)

That said, since this is a TypeScript project, the source must be transpiled to JavaScript before execution. So, if a change is made to one or more modules in the package directory `yarn build` must be run from the project root for the changes to reflect.

So a typical workflow might look like this:

- Developer pulls down repository and changes directory in project root
- Developer runs `yarn install` to install all dependencies of all the packages in accordance with [yarn workspace feature](https://yarnpkg.com/lang/en/docs/workspaces/)
- Developer runs `yarn build` to transpile TypeScript source to JavaScript
- Developer makes changes in one or more packages
- Developer runs `yarn build` to see those changes reflected and linked accordingly
- On occasion, running `yarn clean` may prove useful for resetting the project to clean state
- When a change-set is complete and has gone through the proper code-review etc, a release can be made running `yarn release`. Release versions should follow [SemVer](https://semver.org/) standards.

There are a number of scripts for managing the different services that this project depends.

In particular you can manage you ganache, ipfs, and MySQL docker services using the commands found in the `scripts` section of the [package.json file](package.json).

Bootstrap or manage your MySQL service

```sh
  yarn manage:db
```

Bootstrap or manage your local development ganache instance

```sh
  yarn manage:ganache # OR yarn:manage:balances to view balances of accounts
```

Bootstrap or manage your local development ipfs instance

```sh
  yarn manage:ipfs
```

Add a file/folder to your IPFS node using a relative or absolute path

```sh
  yarn manage:ipfs:add {/path/to/file}
```

## License

Only for internal XY Company use at this time

## Credits

Made with ❤️
by [XYO](https://xyo.network)
