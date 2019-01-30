[logo]: https://www.xy.company/img/home/logo_xy.png

![logo]

# API Archivist GraphQL

This package provides a graphql service that implements the archivist API. This API is largely used by diviners to query the archivist's underlying data-set. Additionally, it can be used by other nodes in the XYO network for discovery in the peer to peer network.

## Getting started

### Clone repository

```sh
git clone https://github.com/XYOracleNetwork/api-archivist-graphql.git
```

### Install dependencies

After cloning the repository, change directory to the folder that houses the repository.

```sh
  cd api-archivist-graphql
```

Once you've switched to the repository directory, install the dependencies. We prefer `yarn` but `npm` works just as well.

```sh
  yarn install
```

## Using API Archivist GraphQL as a dependency

```sh
npm install @xyo-network/api-archivist-graphql
```

or with yarn

```sh
yarn add @xyo-network/api-archivist-graphql
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