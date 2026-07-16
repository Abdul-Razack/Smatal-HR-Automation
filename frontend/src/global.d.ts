/**
 * Global TypeScript patch for Next.js 15 + React 19 RC compatibility.
 *
 * Problem:
 *   Next.js 15 pins @types/react to `npm:types-react@19.0.0-rc.1`.
 *   This RC version has a breaking change: ReactPortal now requires a
 *   `children` property, which makes ReactElement no longer assignable
 *   to ReactNode. This causes false-positive errors on all JSX components
 *   from lucide-react, next/link, shadcn/ui, etc.
 *
 * Fix:
 *   Override the ReactNode type in the 'react' module augmentation to
 *   match the stable React 18 / React 19 final definition, where
 *   ReactElement IS assignable to ReactNode without `children`.
 */
declare global {}

export {};

declare module 'react' {
  type ReactNode =
    | ReactElement
    | string
    | number
    | bigint
    | boolean
    | null
    | undefined
    | Iterable<ReactNode>;
}
