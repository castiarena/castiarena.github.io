import { siteConfig } from '@/config/site'

// STUB — implemented by agent 2.1
export function SiteFooter() {
  return (
    <footer>
      <p>
        © {new Date().getFullYear()} {siteConfig.name}
      </p>
    </footer>
  )
}
