/**
 * Checks if the given value is an error.
 * @param x The value to check.
 * @returns `true` if the given value is an error, otherwise `false`.
 * @internal
 */
export function isError(x: any): x is Error {
    return x instanceof Error || (x && x.stack && x.message);
}

