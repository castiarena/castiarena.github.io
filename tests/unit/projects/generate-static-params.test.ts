import { describe, expect, it } from 'vitest'

import { generateStaticParams } from '@/app/projects/[slug]/page'
import { getAllProjectSlugs } from '@/content'

describe('generateStaticParams (projects)', () => {
  it('returns every project slug, one param object each', () => {
    const params = generateStaticParams()
    const slugs = params.map((p) => p.slug)
    expect(slugs.sort()).toEqual([...getAllProjectSlugs()].sort())
  })
})
