declare module 'uuid' {
  export function v1(options?: v1Options): string;
  export function v4(options?: v4Options): string;
  export function v5(name: string, namespace: string): string;
  export function nil(): string;
  export function parse(s: string): Uint8Array;
  export function unparse(buf: Buffer | Uint8Array): string;
  export function validate(s: string): boolean;
  export function version(s: string): number;

  export interface v1Options {
    node?: string | number[];
    clockseq?: number;
    msecs?: number | Date;
    nsecs?: number;
    random?: number[];
    rng?: () => number[];
  }

  export interface v4Options {
    random?: number[];
    rng?: () => number[];
  }
}
