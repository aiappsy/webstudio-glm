import { test, expect } from '@playwright/test'

test('debug endpoint should return environment status', async () => {
  const response = await fetch('http://localhost:3000/api/debug')
  const data = await response.json()
  
  expect(data.message).toContain('Debug test successful')
  expect(data.env.DATABASE_URL).toBe('SET')
  expect(data.env.NEXTAUTH_SECRET).toBe('SET')
  expect(data.env.OPENROUTER_API_KEY).toBe('SET')
  expect(data.userCount).toBeGreaterThanOrEqual(0)
})