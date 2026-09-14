import { describe, it, expect } from 'vitest'

describe('health', () => {
  it('should pass basic test', () => {
    expect(true).toBe(true)
  })

  it('should have correct environment', () => {
    expect(process.env.NODE_ENV).toBe('test')
  })
})
