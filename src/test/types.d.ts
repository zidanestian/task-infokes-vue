/// <reference types="@testing-library/jest-dom" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module 'vitest' {
  interface Assertion<T = any> extends jest.Matchers<void, T> {}
} 