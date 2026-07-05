// Type shim for React Native's Firebase Auth persistence helper.
//
// `getReactNativePersistence` genuinely exists at runtime — Metro's bundler resolves
// the "firebase/auth" import to @firebase/auth's React-Native-specific build (its
// index.rn.js) automatically, which does export this function. But plain `tsc`
// (run outside Metro, e.g. by this repo's `npm run typecheck`) doesn't know about
// React Native's platform-specific module resolution and only sees the default
// (web) type declarations, which don't include it. This shim just tells tsc the
// function is there so typechecking doesn't fail on something that works fine at
// build/run time in Expo.
import type { Persistence } from "firebase/auth";

declare module "firebase/auth" {
  export function getReactNativePersistence(storage: unknown): Persistence;
}
