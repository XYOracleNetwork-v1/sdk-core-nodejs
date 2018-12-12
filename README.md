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

- [about-me](packages/about-me/README.md)
- [archivist-repository](packages/archivist-repository/README.md)
- [archivist-repository.sql](packages/archivist-repository.sql/README.md)
- [base](packages/base/README.md)
- [bound-witness](packages/bound-witness/README.md)
- [buffer-utils](packages/buffer-utils/README.md)
- [errors](packages/errors/README.md)
- [hashing](packages/hashing/README.md)
- [heuristics](packages/heuristics/README.md)
- [heuristics-common](packages/heuristics-common/README.md)
- [ip-service](packages/ip-service/README.md)
- [logger](packages/logger/README.md)
- [network](packages/network/README.md)
- [network.tcp](packages/network.tcp/README.md)
- [node](packages/node/README.md)
- [origin-block-repository](packages/origin-block-repository/README.md)
- [origin-chain](packages/origin-chain/README.md)
- [peer-connections](packages/peer-connections/README.md)
- [peer-discovery](packages/peer-discovery/README.md)
- [peer-interaction](packages/peer-interaction/README.md)
- [peer-interaction-handlers](packages/peer-interaction-handlers/README.md)
- [peer-interaction-router](packages/peer-interaction-router/README.md)
- [serialization](packages/serialization/README.md)
- [serialization-schema](packages/serialization-schema/README.md)
- [signing](packages/signing/README.md)
- [signing.ecdsa](packages/signing.ecdsa/README.md)
- [signing.rsa](packages/signing.rsa/README.md)
- [storage](packages/storage/README.md)
- [base-node](packages/base-node/README.md)

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

## License

Only for internal XY Company use at this time

## Credits

Made with ❤️
by [XYO](https://xyo.network)
