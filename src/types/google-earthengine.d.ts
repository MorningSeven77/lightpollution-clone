// @google/earthengine ships no type definitions and uses an old
// global-namespace-style CommonJS export, so we type it loosely here
// rather than fighting the whole API surface.
declare module "@google/earthengine" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ee: any;
  export default ee;
}
