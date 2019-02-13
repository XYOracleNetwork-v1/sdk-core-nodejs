declare module 'merge' {
  function clone(input: any): any;
  function recursive(clone: any, ...args: any[]): any;
}