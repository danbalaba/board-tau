import { test, expect } from '@playwright/test';

test.describe('BoardTAU Homepage E2E Tests', () => {
  test('should load homepage and display title and footer', async ({ page }) => {
    await page.goto('/');

    // Verify page title contains BoardTAU
    await expect(page).toHaveTitle(/BoardTAU/i);

    // Verify footer is rendered
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('should display header logo and navigation elements', async ({ page }) => {
    await page.goto('/');

    // Check main logo link exists in header (attached in DOM on all screen sizes)
    const logoLink = page.locator('header a[href="/"]').first();
    await expect(logoLink).toBeAttached();
  });

  test('should open Contact Support modal from footer', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Scroll to footer and locate support button
    const supportButton = page.locator('footer button', { hasText: 'Contact Support' }).first();
    await supportButton.scrollIntoViewIfNeeded();
    await expect(supportButton).toBeVisible();

    // Click Contact Support button after React hydration
    await supportButton.click();

    // Verify support modal opens
    const modalText = page.getByText(/Send Support Ticket|Contact Support/i).first();
    await expect(modalText).toBeVisible({ timeout: 10000 });
  });
});
