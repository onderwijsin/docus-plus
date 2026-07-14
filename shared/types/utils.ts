/**
 * Recursively makes all properties of a type optional, including nested objects.
 *
 * Useful for configuration objects where you want to allow partial overrides
 * of nested properties without requiring all parent properties to be defined.
 *
 * @template T - The type to make deeply partial
 *
 * @example
 * ```typescript
 * interface Config {
 *   api: {
 *     endpoint: string
 *     timeout: number
 *   }
 *   ui: {
 *     theme: string
 *     colors: {
 *       primary: string
 *       secondary: string
 *     }
 *   }
 * }
 *
 * const partialConfig: DeepPartial<Config> = {
 *   ui: {
 *     colors: {
 *       primary: '#000000' // Can override just this property
 *     }
 *   }
 * }
 * ```
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Recursively makes all properties required, while preserving arrays
 * and avoiding accidental recursion into functions.
 *
 * @template T - The type to transform
 * @example
 * type Input = {
 *   foo?: {
 *     bar?: string
 *     list?: Array<{ x?: number }>
 *   }
 * }
 *
 * type Result = DeepRequired<Input>
 */
export type DeepRequired<T> =
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  T extends Function
    ? T // don't f*** with functions
    : T extends (infer U)[]
      ? DeepRequired<U>[] // recurse into array elements
      : T extends object
        ? { [P in keyof T]-?: DeepRequired<T[P]> }
        : T;
