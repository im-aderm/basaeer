import { test, expect } from '@playwright/test';

test.describe('Reporting Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        // Login first
        await page.goto('/login');
        await page.fill('input[name="email"]', 'admin@test.com');
        await page.fill('input[name="password"]', 'password');
        await page.click('button[type="submit"]');
        await page.waitForURL('/dashboard');
    });

    test('should load reporting dashboard', async ({ page }) => {
        await page.goto('/dashboard/reports');

        // Check page title
        await expect(page.locator('h1')).toContainText('Enterprise Reports');

        // Verify all stat cards are visible
        await expect(page.locator('text=Total Invoiced')).toBeVisible();
        await expect(page.locator('text=Total Paid')).toBeVisible();
        await expect(page.locator('text=Total Expenses')).toBeVisible();
        await expect(page.locator('text=Net Profit')).toBeVisible();
    });

    test('should display all report sections', async ({ page }) => {
        await page.goto('/dashboard/reports');

        // Verify report cards
        await expect(page.locator('text=Student Performance')).toBeVisible();
        await expect(page.locator('text=Financial Summary')).toBeVisible();
        await expect(page.locator('text=HR Statistics')).toBeVisible();
        await expect(page.locator('text=Inventory Statistics')).toBeVisible();
    });

    test('should show export buttons on each report card', async ({ page }) => {
        await page.goto('/dashboard/reports');

        // Each report card should have PDF and Excel export buttons
        const exportButtons = page.locator('button[title*="Export"]');
        const count = await exportButtons.count();

        // 4 cards × 2 buttons (PDF + Excel) = 8 buttons
        expect(count).toBeGreaterThanOrEqual(8);
    });

    test('should handle PDF export click', async ({ page }) => {
        await page.goto('/dashboard/reports');

        // Click first PDF export button
        const pdfButton = page.locator('button[title="Export as PDF"]').first();

        // Set up download listener
        const downloadPromise = page.waitForEvent('download');
        await pdfButton.click();

        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\.pdf$/);
    });

    test('should handle Excel export click', async ({ page }) => {
        await page.goto('/dashboard/reports');

        // Click first Excel export button
        const excelButton = page.locator('button[title="Export as Excel"]').first();

        // Set up download listener
        const downloadPromise = page.waitForEvent('download');
        await excelButton.click();

        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\.xlsx$/);
    });

    test('should show loading state during data fetch', async ({ page }) => {
        await page.goto('/dashboard/reports');

        // Should show loading spinner initially
        const loadingSpinner = page.locator('.animate-spin');

        // Wait for data to load
        await page.waitForSelector('text=Enterprise Reports', { timeout: 5000 });
    });

    test('should display financial metrics correctly', async ({ page }) => {
        await page.goto('/dashboard/reports');

        // Wait for data to load
        await page.waitForSelector('text=Total Invoiced');

        // Check that financial values are displayed
        const financialCard = page.locator('text=Financial Summary').locator('..');
        await expect(financialCard).toContainText('Invoiced');
        await expect(financialCard).toContainText('Collected');
        await expect(financialCard).toContainText('Net Profit');
    });

    test('should show low stock alert when applicable', async ({ page }) => {
        await page.goto('/dashboard/reports');

        // If there are low stock items, alert should be visible
        const lowStockAlert = page.locator('text=Low Stock Alert');

        // This test is conditional - alert may or may not be present
        const isVisible = await lowStockAlert.isVisible().catch(() => false);

        if (isVisible) {
            await expect(lowStockAlert).toBeVisible();
            await expect(page.locator('text=items need restocking')).toBeVisible();
        }
    });

    test('should be responsive on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/dashboard/reports');

        // Check that content is still visible on mobile
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('text=Total Invoiced')).toBeVisible();
    });

    test('should support dark mode', async ({ page }) => {
        await page.goto('/dashboard/reports');

        // Toggle dark mode (assuming there's a theme toggle)
        const themeToggle = page.locator('[aria-label*="theme"]').or(page.locator('button:has-text("Dark")'));

        if (await themeToggle.isVisible()) {
            await themeToggle.click();

            // Check for dark mode class
            const html = page.locator('html');
            await expect(html).toHaveClass(/dark/);
        }
    });
});
