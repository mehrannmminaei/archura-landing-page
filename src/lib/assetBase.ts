/** Relative prefix for static assets from the current page depth (e.g. `../../`). */
export function getAssetBase(pathname: string): string {
  const depth = pathname.split('/').filter(Boolean).length;
  return depth === 0 ? './' : '../'.repeat(depth);
}
