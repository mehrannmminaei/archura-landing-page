/** Normalize Express route param (string | string[]) to a single string. */
export function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}
