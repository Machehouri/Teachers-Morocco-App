import { test, expect } from '@playwright/test';

test('landing page displays all key elements', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('nav a', { hasText: 'TeachMe' })).toBeVisible();
  await expect(
    page.getByText('Find The Best Private Teachers In Morocco')
  ).toBeVisible();
  await expect(page.getByText('Explore Teachers')).toBeVisible();
  await expect(page.getByText('Become a Teacher')).toBeVisible();
  await expect(page.getByText('Why Choose TeachMe?')).toBeVisible();
  await expect(page.locator('nav a', { hasText: 'Login' })).toBeVisible();
  await expect(page.locator('nav a', { hasText: 'Sign up' })).toBeVisible();
});
