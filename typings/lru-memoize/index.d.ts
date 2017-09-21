declare module "lru-memoize" {
    type f<T> = () => T
    type ret<T> = (param: f<T>) => f<T>

    export function memoize<T>(size?: number): ret<T>
    export default memoize
}