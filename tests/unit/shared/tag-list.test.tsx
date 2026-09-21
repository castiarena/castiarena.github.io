import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { TagList } from '@/components/shared'

afterEach(cleanup)

describe('TagList', () => {
  it('renders one list item per tag inside a labelled list', () => {
    const tags = ['React', 'TypeScript', 'Next.js']
    render(<TagList tags={tags} />)

    const list = screen.getByRole('list', { name: 'Tags' })
    const items = within(list).getAllByRole('listitem')
    expect(items).toHaveLength(tags.length)
    expect(items.map((item) => item.textContent)).toEqual(tags)
  })

  it('uses secondary badges', () => {
    render(<TagList tags={['CSS']} />)
    expect(screen.getByText('CSS')).toHaveAttribute('data-variant', 'secondary')
  })

  it('accepts a custom label and className', () => {
    render(<TagList tags={['a']} label="Stack" className="mt-4" />)
    expect(screen.getByRole('list', { name: 'Stack' })).toHaveClass('mt-4')
  })

  it('renders nothing for an empty list', () => {
    const { container } = render(<TagList tags={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
