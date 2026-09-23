import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'mobile',
      use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 }, isMobile: false },
    },
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
  ],
  webServer: {
    command: process.env.E2E_SKIP_BUILD ? 'pnpm start' : 'pnpm build && pnpm start',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    // Placeholders (they override .env.local) so the contact form takes its API path; the e2e tests
    // stub Turnstile and intercept **/api/send, so the real API is never called. Same as ci.yml.
    env: {
      NEXT_PUBLIC_EMAIL_API_URL: 'https://email-api.invalid',
      NEXT_PUBLIC_EMAIL_API_KEY: 'pk_test_e2e',
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: '1x00000000000000000000AA',
    },
    timeout: 180_000,
  },
})
