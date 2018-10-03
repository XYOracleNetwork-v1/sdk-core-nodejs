[logo]: https://www.xy.company/img/home/logo_xy.png

![logo]

# XYO CORE SDK (sdk-core-nodejs)

[![CircleCI](https://circleci.com/gh/XYOracleNetwork/sdk-core-nodejs.svg?style=svg)](https://circleci.com/gh/XYOracleNetwork/sdk-core-nodejs)

Core functionality for the XYO nodejs projects. This repository implements
the core objects used in the XYO protocol. Additionally it provides core
XYO features like performing bound-witnesses, hashing, signing, and serialization.

## Getting started

### Install dependencies

```sh
  yarn install
```

### Run tests

Run all tests:

```sh
  yarn test
```

Run a set of tests in a particular file:

i.e. Where the test file is `test/integration/lib.spec.ts`

```sh
  NODE_ENV=test && node ./node_modules/jest/bin/jest test/integration/lib.spec.ts
```

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
