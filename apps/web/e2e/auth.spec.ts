import { test, expect } from '@playwright/test';

const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';
const TEST_NAME = 'Test User';
const TEST_WORKSPACE = `Test Workspace ${Date.now()}`;

test.describe('Authentication Flow', () => {
  test('should sign up new user', async ({ page }) => {
    // Navigate to auth page
    await page.goto('/auth');
    await expect(page).toHaveTitle(/TrainApp/);

    // Click "Criar conta" button
    await page.click('button:has-text("Criar conta")');

    // Fill signup form
    await page.fill('input[placeholder="João Silva"]', TEST_NAME);
    await page.fill('input[placeholder="Silva Personal Training"]', TEST_WORKSPACE);
    await page.fill('input[placeholder="seu@email.com"]', TEST_EMAIL);
    await page.fill('input[placeholder="Mínimo 8 caracteres"]', TEST_PASSWORD);

    // Submit form
    await page.click('button:has-text("Criar conta")');

    // Should redirect to onboard
    await page.waitForURL('/onboard');
    await expect(page).toHaveURL(/onboard/);
    await expect(page.locator('h1')).toContainText('Escolha seu plano');
  });

  test('should login with existing user', async ({ page }) => {
    // Navigate to auth page
    await page.goto('/auth');

    // Ensure we're in login mode (default)
    const heading = page.locator('p:has-text("Entre em sua conta")');
    await expect(heading).toBeVisible();

    // Fill login form
    await page.fill('input[placeholder="seu@email.com"]', TEST_EMAIL);
    await page.fill('input[placeholder="Mínimo 8 caracteres"]', TEST_PASSWORD);

    // Submit form
    await page.click('button:has-text("Entrar")');

    // Should redirect to dashboard
    await page.waitForURL('/dashboard');
    await expect(page).toHaveURL(/dashboard$/);
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/auth');

    // Fill with wrong password
    await page.fill('input[placeholder="seu@email.com"]', TEST_EMAIL);
    await page.fill('input[placeholder="Mínimo 8 caracteres"]', 'WrongPassword123!');

    // Submit form
    await page.click('button:has-text("Entrar")');

    // Should stay on auth page or show error
    // Wait a bit for potential error message
    await page.waitForTimeout(1000);

    // Either stays on auth or shows error (both acceptable)
    const isOnAuthPage = page.url().includes('/auth');
    const hasErrorText = await page.locator('text=/erro|invalid|incorreto/i').isVisible().catch(() => false);

    expect(isOnAuthPage || hasErrorText).toBeTruthy();
  });

  test('should toggle between login and signup', async ({ page }) => {
    await page.goto('/auth');

    // Start on login
    await expect(page.locator('p:has-text("Entre em sua conta")')).toBeVisible();

    // Click "Criar conta"
    await page.click('button:has-text("Criar conta")');
    await expect(page.locator('p:has-text("Comece sua jornada")')).toBeVisible();

    // Name and workspace fields should appear
    await expect(page.locator('input[placeholder="João Silva"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Silva Personal Training"]')).toBeVisible();

    // Click "Entrar"
    await page.click('button:has-text("Entrar")');
    await expect(page.locator('p:has-text("Entre em sua conta")')).toBeVisible();

    // Fields should disappear
    await expect(page.locator('input[placeholder="João Silva"]')).not.toBeVisible();
  });
});
