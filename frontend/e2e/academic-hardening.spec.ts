import { test, expect } from '@playwright/test';

test.describe('Academic Hardening Workflows', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', 'admin@test.com');
        await page.fill('input[name="password"]', 'password');
        await page.click('button[type="submit"]');
        await page.waitForURL('/dashboard');
    });

    test('should manage report templates', async ({ page }) => {
        await page.goto('/dashboard/report-templates');
        await expect(page.locator('h1')).toContainText('Report Templates');

        // Create new template
        await page.click('text=New Template');
        await page.waitForURL('**/designer*');
        
        await expect(page.locator('input[placeholder="Template Name"]')).toBeVisible();
        await page.fill('input[placeholder="Template Name"]', 'E2E Test Template');
        
        // Add a section
        await page.click('text=Text Block');
        await expect(page.locator('text=Remarks')).toBeVisible();

        // Save
        await page.click('text=Save Template');
        await page.waitForURL('/dashboard/report-templates');
        
        await expect(page.locator('text=E2E Test Template')).toBeVisible();
    });

    test('should trigger background export from academic page', async ({ page }) => {
        await page.goto('/dashboard/exams/report-cards');
        
        // Fill form (using fallback IDs for demo)
        await page.fill('label:has-text("student ID") + input', 'test-student-id');
        await page.fill('label:has-text("session ID") + input', 'test-session-id');
        
        // Click Export
        await page.click('button:has-text("Export")');
        await expect(page.locator('text=queued successfully')).toBeVisible();

        // Navigate to exports dashboard
        await page.goto('/dashboard/exports');
        await expect(page.locator('text=REPORT CARD')).toBeVisible();
    });

    test('should perform bulk mark entry with virtualization', async ({ page }) => {
        await page.goto('/dashboard/exams/bulk-entry');
        
        // Enter IDs
        await page.fill('input[placeholder="Session ID"]', 'session-123');
        await page.fill('input[placeholder="Section ID"]', 'section-456');
        await page.fill('input[placeholder="Subject ID"]', 'subject-789');
        
        // Open spreadsheet
        await page.click('text=Open Entry Spreadsheet');
        await expect(page.locator('text=Batch Mark Entry')).toBeVisible();

        // Enter some marks (assuming at least one row exists)
        const cells = page.locator('input[type="number"]');
        if (await cells.count() > 0) {
            await cells.first().fill('85');
            await page.keyboard.press('Tab');
            
            // Verify unsaved changes badge
            await expect(page.locator('text=unsaved changes')).toBeVisible();
            
            // Save
            await page.click('text=Save All');
            await expect(page.locator('text=saved successfully')).toBeVisible();
        }
    });

    test('should handle background result computation', async ({ page }) => {
        await page.goto('/dashboard/exams/publication');
        
        // Fill form
        await page.fill('label:has-text("session ID") + input', 'test-session');
        await page.fill('label:has-text("section ID") + input', 'test-section');
        
        // Start computation
        await page.click('text=Compute Results');
        await expect(page.locator('text=started in background')).toBeVisible();
        
        // Check for progress indicator
        await expect(page.locator('button:has-text("Computing")')).toBeVisible();
    });
});
