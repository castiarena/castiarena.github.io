import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true, // /bio -> /bio/index.html (GitHub Pages serves this without a rewrite)
  images: { unoptimized: true },
  reactStrictMode: true,
  typedRoutes: true,
  // No basePath: castiarena.github.io is a *user* site served from the domain root.
}

export default nextConfig
