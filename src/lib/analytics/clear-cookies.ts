/** `_ga` holds the client ID; `_ga_<container>` holds the session state. Both are GA4's own. */
const GA_COOKIE_PATTERN = /^_ga(_.+)?$/

/** Cookie names currently readable from `document.cookie` that belong to GA4. */
export function getGoogleAnalyticsCookieNames(cookie: string): string[] {
  const names = cookie
    .split(';')
    .map((pair) => pair.split('=')[0]?.trim() ?? '')
    .filter((name) => GA_COOKIE_PATTERN.test(name))
  return [...new Set(names)]
}

/**
 * Domains GA4 may have written the cookie on: the exact host, the host as a dot-prefixed domain
 * (what `cookie_domain: 'auto'` resolves to), and the registrable parent. Expiring a cookie only
 * works from the domain that set it, and a `domain` the browser rejects is ignored silently, so
 * the cheapest correct thing is to try all of them.
 */
function cookieDomains(hostname: string): (string | undefined)[] {
  const labels = hostname.split('.')
  const parent = labels.length > 2 ? `.${labels.slice(1).join('.')}` : undefined
  return [undefined, hostname, `.${hostname}`, parent]
}

/**
 * Deletes GA4's cookies on the current host and its parent domain. Called when a visitor switches
 * from granted to denied: `gtag.js` is never loaded again, but the cookies it already set would
 * otherwise live for two years.
 */
export function clearGoogleAnalyticsCookies(): void {
  if (typeof document === 'undefined') return

  for (const name of getGoogleAnalyticsCookieNames(document.cookie)) {
    for (const domain of cookieDomains(window.location.hostname)) {
      document.cookie = `${name}=; path=/; max-age=0${domain ? `; domain=${domain}` : ''}`
    }
  }
}
