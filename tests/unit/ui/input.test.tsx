import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { Input } from '@/components/ui/input'

afterEach(cleanup)

describe('Input', () => {
  it('wires aria-invalid and aria-describedby to the rendered error message', () => {
    render(<Input aria-label="Email" error="Enter a valid email address." />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('aria-invalid', 'true')

    const describedBy = input.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()

    const message = document.getElementById(describedBy!)
    expect(message).toHaveTextContent('Enter a valid email address.')
    expect(message).toHaveAttribute('role', 'alert')
  })

  it('has no aria-invalid or description when there is no error', () => {
    render(<Input aria-label="Email" />)
    const input = screen.getByLabelText('Email')
    expect(input).not.toHaveAttribute('aria-invalid')
    expect(input).not.toHaveAttribute('aria-describedby')
  })

  it('preserves a caller-supplied aria-describedby alongside the error id', () => {
    render(
      <>
        <span id="hint">Use your work email.</span>
        <Input aria-label="Email" aria-describedby="hint" error="Required." />
      </>,
    )
    const describedBy = screen.getByLabelText('Email').getAttribute('aria-describedby')
    expect(describedBy).toContain('hint')
    expect(describedBy?.split(' ')).toHaveLength(2)
  })
})
