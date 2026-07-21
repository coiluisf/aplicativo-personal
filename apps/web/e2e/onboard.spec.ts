import { test, expect } from '@playwright/test';

test.describe('Onboard - Plan Selection', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to onboard directly (in real test, would login first)
    await page.goto('/onboard');
  });

  test('should display all three pricing plans', async ({ page }) => {
    // Check for three plan cards
    const plans = ['Starter', 'Professional', 'Enterprise'];

    for (const plan of plans) {
      const planCard = page.locator(`text=${plan}`);
      await expect(planCard).toBeVisible();
    }
  });

  test('should show correct prices for each plan', async ({ page }) => {
    // Starter - R$ 49,00
    await expect(page.locator('text=R$ 49,00')).toBeVisible();

    // Professional - R$ 99,00
    await expect(page.locator('text=R$ 99,00')).toBeVisible();

    // Enterprise - R$ 299,00
    await expect(page.locator('text=R$ 299,00')).toBeVisible();
  });

  test('should highlight Professional as most popular', async ({ page }) => {
    // Find the "Mais popular" badge
    const popularBadge = page.locator('text=Mais popular');
    await expect(popularBadge).toBeVisible();

    // It should be on the Professional card
    const professionalCard = page.locator('text=Professional').first().locator('..');
    const badgeInCard = professionalCard.locator('text=Mais popular');
    await expect(badgeInCard).toBeVisible();
  });

  test('should display feature lists for each plan', async ({ page }) => {
    // Each plan should have features with Check icons
    const checkIcons = page.locator('[class*="text-indigo"]').filter({ has: page.locator('svg') });

    // Should have multiple check marks (at least 9 for 3 plans x 3 features minimum)
    const count = await checkIcons.count();
    expect(count).toBeGreaterThanOrEqual(9);
  });

  test('should allow clicking plan selection buttons', async ({ page }) => {
    // Find all "Começar com este plano" buttons
    const buttons = page.locator('button:has-text("Começar com este plano")');

    // Should have 3 buttons (one per plan)
    const count = await buttons.count();
    expect(count).toBe(3);

    // All buttons should be visible and enabled
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      await expect(button).toBeVisible();
      await expect(button).toBeEnabled();
    }
  });

  test('should show free trial message', async ({ page }) => {
    // Check for "7 dias grátis" message
    const freeTrialText = page.locator('text=/7 dias grátis|7-day free/i');
    await expect(freeTrialText).toBeVisible();
  });

  test('should display footer disclaimer', async ({ page }) => {
    // Check for terms of service message
    const disclaimer = page.locator('text=/Todos os planos incluem|suporte/i');
    await expect(disclaimer).toBeVisible();
  });

  test('should be responsive on mobile', async ({ browser }) => {
    const context = await browser.createContext({
      viewport: { width: 375, height: 667 }, // iPhone size
    });
    const page = await context.newPage();

    await page.goto('/onboard');

    // All plan cards should be visible but stacked vertically
    const startCard = page.locator('text=Starter').first();
    await expect(startCard).toBeVisible();

    // Scroll to see other cards
    await page.locator('text=Professional').first().scrollIntoViewIfNeeded();
    await expect(page.locator('text=Professional').first()).toBeVisible();

    await page.locator('text=Enterprise').first().scrollIntoViewIfNeeded();
    await expect(page.locator('text=Enterprise').first()).toBeVisible();

    await context.close();
  });

  test('should support dark mode', async ({ page }) => {
    // Add dark mode class to html element
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
    });

    // Page should still be visible
    await expect(page.locator('text=Escolha seu plano')).toBeVisible();

    // Remove dark mode
    await page.evaluate(() => {
      document.documentElement.removeAttribute('data-theme');
    });

    await expect(page.locator('text=Escolha seu plano')).toBeVisible();
  });
});
