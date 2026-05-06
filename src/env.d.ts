/// <reference types="vite/client" />

// Tells TypeScript that every .vue file is a valid module exporting
// a Vue component. Without this, TS has no declaration file for .vue
// imports and falls back to implicit `any` (error 7016).
//
// This is the standard shim used by Vite + Vue 3 + TypeScript projects.
// It lives in src/ so tsconfig's include pattern picks it up automatically.

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}
