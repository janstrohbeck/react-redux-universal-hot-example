declare const __SERVER__: boolean
declare const __DEVELOPMENT__: boolean
declare const __DEVTOOLS__: boolean
declare const __CLIENT__: boolean
declare const __DLLS__: boolean
declare const __DISABLE_SSR__: boolean
declare const System: any

declare namespace webpackIsomorphicTools {
    export function refresh(): void
    export function assets(): string[]
}