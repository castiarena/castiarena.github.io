import { expect, test } from '@playwright/test'

const routes = ['/', '/bio/', '/experiments/', '/projects/'] as const

for (const route of routes) {
  test(`smoke: ${route} responds 200 and has exactly one h1`, async ({ page }) => {
    const response = await page.goto(route)
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toHaveCount(1)
  })
}
