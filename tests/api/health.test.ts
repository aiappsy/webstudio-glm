import { test, expect } from '@playwright/test'

test('health endpoint should return status', async () => {
  const response = await fetch('http://localhost:3000/api/health')
  const data = await response.json()
  
  expect(data.status).toBe('healthy')
  expect(data.userCount).toBeGreaterThanOrEqual(0)
})