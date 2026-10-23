import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator } from '@playwright/test'

/** Resolves once every finite CSS transition/animation inside `locator` has finished. */
async function settleAnimations(locator: Locator) {
  await locator.evaluate((el) =>
    Promise.all(
      el
        .getAnimations({ subtree: true })
        .filter((animation) => animation.effect?.getComputedTiming().endTime !== Infinity)
        .map((animation) => animation.finished),
    ),
  )
}

// Stands in for Cloudflare's script: renders a placeholder and issues a fake token straight away,
// so no real challenge (or network) is involved.
const TURNSTILE_STUB = `
  window.turnstile = {
    render(el, options) {
      el.textContent = 'Turnstile stub'
      setTimeout(() => options.callback('e2e-token'), 50)
      return 'e2e-widget'
    },
    reset() {},
    remove() {},
  }
`

test('contact dialog sends through the email API and passes axe', async ({ page }) => {
  let sentBody: unknown = null

  await page.route('https://challenges.cloudflare.com/turnstile/**', (route) =>
    route.fulfill({ contentType: 'text/javascript', body: TURNSTILE_STUB }),
  )
  await page.route('**/api/send', async (route) => {
    const cors = {
      'Access-Control-Allow-Origin': new URL(page.url()).origin,
      'Access-Control-Allow-Headers': 'Authorization, Content-Type, Idempotency-Key',
      'Access-Control-Allow-Methods': 'POST',
    }
    if (route.request().method() === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: cors })
    }
    sentBody = route.request().postDataJSON()
    return route.fulfill({
      status: 200,
      headers: cors,
      contentType: 'application/json',
      body: JSON.stringify({ id: 'e2e-email' }),
    })
  })

  await page.goto('/')
  await page
    .getByRole('button', { name: /get in touch|contact/i })
    .filter({ visible: true })
    .first()
    .click()

  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await dialog.getByLabel('Name').fill('Playwright Visitor')
  await dialog.getByLabel('Email').fill('visitor@example.com')
  await dialog.getByLabel('Message').fill('Hello from the end-to-end test, long enough.')

  const send = dialog.getByRole('button', { name: 'Send message' })
  await expect(send).toBeEnabled() // the stubbed Turnstile token has arrived
  // The button fades from `disabled:opacity-50` to full opacity (`transition-all`); axe measuring
  // mid-fade sees blended colours and reports a false contrast failure. Let it settle first.
  await settleAnimations(dialog)

  const axe = await new AxeBuilder({ page }).include('[role="dialog"]').analyze()
  expect(axe.violations).toEqual([])

  // The 3s minimum time-to-submit is counted from when the dialog opened.
  await page.waitForTimeout(3100)
  await send.click()

  await expect(dialog.getByRole('status')).toContainText("I'll be in touch")
  expect(sentBody).toEqual({
    template: 'contact',
    reply_to: 'visitor@example.com',
    data: {
      name: 'Playwright Visitor',
      email: 'visitor@example.com',
      message: 'Hello from the end-to-end test, long enough.',
    },
    captcha_token: 'e2e-token',
  })

  await settleAnimations(dialog)
  const axeAfter = await new AxeBuilder({ page }).include('[role="dialog"]').analyze()
  expect(axeAfter.violations).toEqual([])
})
