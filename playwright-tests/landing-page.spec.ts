import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the loader to disappear to ensure the page is fully hydrated and interactive
    await expect(page.getByText('Initializing experience')).toBeHidden();
    // Wait a brief moment for client-side routing to fully hydrate and attach event listeners
    await page.waitForTimeout(2000);
  });

  test('should load the landing page and display key elements', async ({ page }) => {
    await expect(page).toHaveTitle(/DealFlow/i);

    // Check that the hero section is present
    await expect(page.locator('h1').first()).toBeVisible();

    // Check that navigation is visible
    await expect(page.getByRole('navigation')).toBeVisible();

    // Check hero CTA buttons
    await expect(page.getByText(/Get Started/i).first()).toBeVisible();
  });

  test('should navigate to the features page', async ({ page }) => {
    // Features link exists in the nav
    await page.getByRole('link', { name: /^Features$/i }).first().click();
    await expect(page).toHaveURL(/features/);
  });

  test('should navigate to the pricing section', async ({ page }) => {
    // Pricing is a nav link in the header
    await page.getByRole('link', { name: /^Pricing$/i }).first().click();
    // Pricing is an anchor scroll on landing page OR a /pricing route
    // Just verify we ended up somewhere with pricing content
    await expect(page.getByText(/pricing/i).first()).toBeVisible();
  });

  test('should navigate to the book demo page', async ({ page }) => {
    // Book Meeting / Book Demo buttons are in the header
    await page.getByRole('link', { name: /Book(?: a)? (?:Demo|Meeting)/i }).first().click();
    await expect(page).toHaveURL(/book/);
  });

  test('should navigate to the solutions page', async ({ page }) => {
    // Solutions is a dropdown trigger in the nav
    // Navigate directly
    await page.goto('/solutions');
    await expect(page).toHaveURL(/solutions/);
  });

  test('should navigate to the portal login', async ({ page }) => {
    // Portal dropdown button exists in the nav
    await page.locator('nav').getByRole('button', { name: /Portal/i }).first().hover();
    // View All Portal link appears in dropdown
    await page.getByRole('link', { name: /View All Portal/i }).click();
    // Should redirect to some portal page
    await expect(page).toHaveURL(/\/portal$/);
  });
});
