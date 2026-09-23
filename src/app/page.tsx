import type { Metadata } from 'next'

import {
  ContactBand,
  Hero,
  ImpactStrip,
  LatestExperiments,
  SelectedProjects,
} from '@/components/home'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: { absolute: siteConfig.title },
  description: siteConfig.description,
  alternates: { canonical: '/' },
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <ImpactStrip />
      <SelectedProjects />
      <LatestExperiments />
      <ContactBand />
    </>
  )
}
