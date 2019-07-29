declare module 'bs58' {
    export function encode(buffer: Buffer): string
    export function  decodeUnsafe(string: string): Buffer | undefined
    export function  decode(string: string): Buffer
}
