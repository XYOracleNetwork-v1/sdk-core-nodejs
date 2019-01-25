interface IMultiaddr {
  nodeAddress(): IAddress
}

interface IAddress {
  port: number,
  address: string,
}

declare module 'multiaddr' {
  export default function (address: string): IMultiaddr
}
