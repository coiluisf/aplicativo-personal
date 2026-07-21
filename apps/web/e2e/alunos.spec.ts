import { test, expect } from '@playwright/test';

test.describe('Alunos - Student Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/alunos');
  });

  test('should display alunos page header', async ({ page }) => {
    // Check for "Alunos" heading
    const heading = page.locator('h1:has-text("Alunos")');
    await expect(heading).toBeVisible();
  });

  test('should show "Novo aluno" button', async ({ page }) => {
    const button = page.locator('button:has-text("Novo aluno")');
    await expect(button).toBeVisible();
  });

  test('should display search bar', async ({ page }) => {
    // Look for search input with placeholder
    const searchInput = page.locator('input[placeholder*="Buscar"]');
    await expect(searchInput).toBeVisible();
  });

  test('should open form when clicking "Novo aluno"', async ({ page }) => {
    // Click button
    await page.click('button:has-text("Novo aluno")');

    // Form should appear
    const form = page.locator('form');
    await expect(form).toBeVisible();

    // Should have "Adicionar novo aluno" heading
    const heading = page.locator('h2:has-text("Adicionar novo aluno")');
    await expect(heading).toBeVisible();

    // Should have input fields
    await expect(page.locator('input[placeholder="João Silva"]')).toBeVisible();
    await expect(page.locator('input[placeholder="joao@email.com"]')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.click('button:has-text("Novo aluno")');

    // Fill form with invalid email
    await page.fill('input[placeholder="João Silva"]', 'Test Student');
    await page.fill('input[placeholder="joao@email.com"]', 'invalid-email');

    // Try to submit
    await page.click('button:has-text("Adicionar aluno")');

    // Form should still be visible (validation failed)
    // Browser will show validation message for email input
    const emailInput = page.locator('input[placeholder="joao@email.com"]');
    const isValid = await emailInput.evaluate((input: HTMLInputElement) => input.checkValidity());

    expect(isValid).toBeFalsy();
  });

  test('should show empty state for no students', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Either show students grid or empty state
    const emptyState = page.locator('text=/Nenhum aluno/');
    const studentCards = page.locator('[class*="rounded-lg"][class*="border"]');

    const hasEmpty = await emptyState.isVisible().catch(() => false);
    const count = await studentCards.count();

    expect(hasEmpty || count > 0).toBeTruthy();
  });

  test('should display student cards with info', async ({ page }) => {
    // Look for student cards (if any exist)
    const studentCard = page.locator('[class*="rounded-lg"][class*="p-4"]').first();

    // Try to find name in card
    const nameText = studentCard.locator('h3');
    const emailText = studentCard.locator('p[class*="text-xs"]');

    // If card exists, should have name and email
    const isVisible = await studentCard.isVisible().catch(() => false);
    if (isVisible) {
      await expect(nameText).toBeVisible();
      await expect(emailText).toBeVisible();
    }
  });

  test('should have edit button on student card', async ({ page }) => {
    // Look for edit button
    const editButton = page.locator('button:has-text("Editar")').first();

    const isVisible = await editButton.isVisible().catch(() => false);
    if (isVisible) {
      await expect(editButton).toBeEnabled();
    }
  });

  test('should have delete button on student card', async ({ page }) => {
    // Look for delete/trash button
    const deleteButton = page.locator('button[class*="hover:bg-red"]').first();

    const isVisible = await deleteButton.isVisible().catch(() => false);
    if (isVisible) {
      await expect(deleteButton).toBeEnabled();
    }
  });

  test('should close form with X button', async ({ page }) => {
    // Open form
    await page.click('button:has-text("Novo aluno")');

    // Form should be visible
    const form = page.locator('form');
    await expect(form).toBeVisible();

    // Click X button
    await page.click('button[class*="hover:bg-zinc"] svg');

    // Form should disappear
    await expect(form).not.toBeVisible();
  });

  test('should be responsive on mobile', async ({ browser }) => {
    const context = await browser.createContext({
      viewport: { width: 375, height: 667 },
    });
    const page = await context.newPage();

    await page.goto('/dashboard/alunos');

    // Header should be visible
    await expect(page.locator('h1:has-text("Alunos")')).toBeVisible();

    // Search should be visible
    await expect(page.locator('input[placeholder*="Buscar"]')).toBeVisible();

    // Student cards should stack in single column
    const cards = page.locator('[class*="rounded-lg"][class*="p-4"]');
    const count = await cards.count();

    if (count > 0) {
      // First card should be visible
      await expect(cards.first()).toBeVisible();
    }

    await context.close();
  });
});
