/**
 * A nav item is active on an exact match, or on any nested route below it — except "/", which
 * would otherwise match every path as a prefix and stay permanently "active".
 */
export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || (href !== '/' && pathname.startsWith(href))
}
