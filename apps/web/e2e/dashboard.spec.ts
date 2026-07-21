import { test, expect } from '@playwright/test';

test.describe('Dashboard - Main Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    // In real tests with auth, would login first
    await page.goto('/dashboard');
  });

  test('should display dashboard header', async ({ page }) => {
    // Check for "Dashboard" title
    const heading = page.locator('h1:has-text("Dashboard")');
    await expect(heading).toBeVisible();
  });

  test('should show "Novo agendamento" button', async ({ page }) => {
    // Button should be visible in header
    const button = page.locator('button:has-text("Novo agendamento")');
    await expect(button).toBeVisible();
    await expect(button).toContainText('Novo agendamento');
  });

  test('should display stats cards grid', async ({ page }) => {
    // Check for stat labels
    const statLabels = ['Alunos ativos', 'Sessões agendadas', 'Receita', 'Assinaturas ativas'];

    for (const label of statLabels) {
      const stat = page.locator(`text=${label}`);
      await expect(stat).toBeVisible();
    }
  });

  test('should display stats with values', async ({ page }) => {
    // Wait for stats to load
    await page.waitForLoadState('networkidle');

    // Stats should have numeric values
    const statValues = page.locator('text=/^\\d+$/');

    // Should have at least 1 numeric value visible
    const count = await statValues.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should display chart section', async ({ page }) => {
    // Look for "Sessões esta semana" heading
    const chartHeading = page.locator('h2:has-text("Sessões esta semana")');
    await expect(chartHeading).toBeVisible();
  });

  test('should display upcoming sessions section', async ({ page }) => {
    // Look for "Próximas sessões" heading
    const sessionsHeading = page.locator('h2:has-text("Próximas sessões")');
    await expect(sessionsHeading).toBeVisible();
  });

  test('should have view all sessions link', async ({ page }) => {
    // Look for link text "Ver todas as sessões"
    const link = page.locator('a:has-text("Ver todas as sessões")');
    await expect(link).toBeVisible();

    // Link should point to agendamentos page
    const href = await link.getAttribute('href');
    expect(href).toContain('/dashboard/agendamentos');
  });

  test('should display empty state for no sessions', async ({ page }) => {
    // Wait for load
    await page.waitForLoadState('networkidle');

    // Either show sessions or "Nenhuma sessão agendada"
    const emptyState = page.locator('text=Nenhuma sessão agendada');
    const hasSessions = page.locator('[class*="p-3"]').filter({ has: page.locator('text=/Próximo|Concluído/') }).isVisible();

    const hasEmpty = await emptyState.isVisible().catch(() => false);
    const hasSome = await hasSessions.catch(() => false);

    expect(hasEmpty || hasSome).toBeTruthy();
  });

  test('should navigate to agendamentos on button click', async ({ page }) => {
    // Click "Novo agendamento"
    await page.click('button:has-text("Novo agendamento")');

    // Should navigate to agendamentos page
    await page.waitForURL(/agendamentos/);
    await expect(page).toHaveURL(/agendamentos/);
  });

  test('should be responsive on mobile', async ({ browser }) => {
    const context = await browser.createContext({
      viewport: { width: 375, height: 667 },
    });
    const page = await context.newPage();

    await page.goto('/dashboard');

    // Header and title should be visible
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();

    // Stats should stack vertically (md:grid-cols-4 → single column on small screens)
    const stats = page.locator('[class*="rounded-lg"][class*="border"]');
    const count = await stats.count();
    expect(count).toBeGreaterThanOrEqual(1);

    await context.close();
  });

  test('should support dark mode', async ({ page }) => {
    // Toggle dark mode (if supported by app)
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
    });

    // Content should still be visible
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();

    // Background should change
    const body = page.locator('body');
    const classes = await body.getAttribute('class');
    expect(classes).toContain('dark');
  });

  test('should have proper sticky header', async ({ page }) => {
    // Header should be sticky (position: sticky or fixed)
    const header = page.locator('[class*="sticky"][class*="top-0"]');

    // Header should be visible even when scrolling
    const isSticky = await header.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.position === 'fixed' || style.position === 'sticky';
    });

    expect(isSticky).toBeTruthy();
  });
});
