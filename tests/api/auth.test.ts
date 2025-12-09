import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should redirect unauthenticated users to home', async ({ page }) => {
    const response = await page.goto('http://localhost:3000')
    expect(response?.url()).toContain('/auth/signin')
  })

  test('health endpoint should return status', async () => {
    const response = await fetch('http://localhost:3000/api/health')
    const data = await response.json()
    expect(data.status).toBe('healthy')
    expect(data.userCount).toBeGreaterThanOrEqual(0)
  })

  test('workspaces endpoint should require authentication', async () => {
    const response = await fetch('http://localhost:3000/api/workspaces')
    expect(response.status).toBe(401)
  })
})