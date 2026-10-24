import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

/**
 * Everything Google could be contacted on. `playwright.config.ts` builds with a fake measurement
 * ID and `NEXT_PUBLIC_DEPLOY_ENV=production`, so analytics are *configured* here — which is the
 * only way to prove that what actually gates `gtag.js` is consent, not configuration.
 */
const GOOGLE = /(googletagmanager|google-analytics|analytics\.google)\.com/

/**
 * Records every request aimed at Google and answers it locally, so a run can never send a hit —
 * not even with the fake ID. The returned array is the assertion surface: its length is the
 * number of requests the page tried to make.
 */
async function watchGoogle(page: Page): Promise<string[]> {
  const attempted: string[] = []
  page.on('request', (request) => {
    if (GOOGLE.test(request.url())) attempted.push(request.url())
  })
  await page.route(GOOGLE, (route) =>
    route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }),
  )
  return attempted
}

const banner = (page: Page) => page.getByRole('region', { name: 'Cookie preferences' })
const accept = (page: Page) => page.getByRole('button', { name: 'Accept' })
const decline = (page: Page) => page.getByRole('button', { name: 'Decline' })
const reopen = (page: Page) => page.getByRole('button', { name: 'Cookie preferences' })

async function gaCookieNames(page: Page): Promise<string[]> {
  const cookies = await page.context().cookies()
  return cookies.map((cookie) => cookie.name).filter((name) => /^_ga(_.+)?$/.test(name))
}

test('requests nothing from Google before the visitor has answered', async ({ page }) => {
  const attempted = await watchGoogle(page)

  await page.goto('/')
  await expect(banner(page)).toBeVisible()
  await page.waitForLoadState('networkidle')

  expect(attempted).toEqual([])
  expect(await gaCookieNames(page)).toEqual([])
})

test('a Decline keeps it that way, on this page view and the next', async ({ page }) => {
  const attempted = await watchGoogle(page)

  await page.goto('/')
  await decline(page).click()
  await expect(banner(page)).toBeHidden()

  await page.reload()
  await page.waitForLoadState('networkidle')

  // The stored choice is honoured, so the visitor is not asked a second time.
  await expect(banner(page)).toBeHidden()
  expect(attempted).toEqual([])
  expect(await gaCookieNames(page)).toEqual([])
})

test('an Accept loads gtag.js, and the next page view loads it without asking again', async ({
  page,
}) => {
  const attempted = await watchGoogle(page)

  await page.goto('/')
  await expect(banner(page)).toBeVisible()
  expect(attempted).toEqual([])

  await accept(page).click()
  await expect(banner(page)).toBeHidden()
  await expect.poll(() => attempted.length).toBeGreaterThan(0)
  expect(attempted.some((url) => url.includes('G-E2ETEST000'))).toBe(true)

  const beforeReload = attempted.length
  await page.reload()
  await page.waitForLoadState('networkidle')

  await expect(banner(page)).toBeHidden()
  await expect.poll(() => attempted.length).toBeGreaterThan(beforeReload)
})

test('revoking from the footer clears the GA cookies and stops further requests', async ({
  page,
}) => {
  const attempted = await watchGoogle(page)

  await page.goto('/')
  await accept(page).click()
  await expect.poll(() => attempted.length).toBeGreaterThan(0)

  // gtag.js is stubbed out, so it never sets its own cookies. These stand in for the ones a real
  // GA4 would have written — what's under test is our deletion, which is the part we wrote.
  await page.context().addCookies([
    { name: '_ga', value: 'GA1.1.1234.5678', url: page.url() },
    { name: '_ga_E2ETEST000', value: 'GS1.1.1', url: page.url() },
  ])
  expect(await gaCookieNames(page)).toHaveLength(2)

  await reopen(page).click()
  await expect(banner(page)).toBeVisible()

  const beforeRevoke = attempted.length
  await decline(page).click()

  // Revoking reloads the page, which is the only way to stop a gtag.js that is already running.
  await page.waitForLoadState('networkidle')
  await expect(banner(page)).toBeHidden()
  expect(await gaCookieNames(page)).toEqual([])
  expect(attempted.length).toBe(beforeRevoke)
})

test('the consent banner passes axe', async ({ page }) => {
  await watchGoogle(page)

  await page.goto('/')
  await expect(banner(page)).toBeVisible()

  const axe = await new AxeBuilder({ page }).analyze()
  expect(axe.violations).toEqual([])
})
