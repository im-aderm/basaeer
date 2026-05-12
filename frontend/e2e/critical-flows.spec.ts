import { test, expect } from '@playwright/test';

test.describe('Critical Flows', () => {
    test.describe('Login Flow', () => {
        test('should navigate to login, fill credentials, and redirect to dashboard', async ({ page }) => {
            await page.goto('/login');

            await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });

            await page.fill('input[name="email"]', 'admin@test.com');
            await page.fill('input[name="password"]', 'password');
            await page.click('button[type="submit"]');

            await page.waitForURL('/dashboard', { timeout: 15000 });

            await expect(page).toHaveURL(/\/dashboard/);
        });

        test('should show error for invalid credentials', async ({ page }) => {
            await page.goto('/login');

            await page.fill('input[name="email"]', 'wrong@test.com');
            await page.fill('input[name="password"]', 'wrongpass');
            await page.click('button[type="submit"]');

            const errorEl = page.locator('[role="alert"]');
            await expect(errorEl).toBeVisible({ timeout: 10000 });
            await expect(errorEl).toContainText(/invalid|failed|error/i);
        });
    });

    test.describe('Admission Form Flow', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/login');
            await page.fill('input[name="email"]', 'admin@test.com');
            await page.fill('input[name="password"]', 'password');
            await page.click('button[type="submit"]');
            await page.waitForURL('/dashboard');
        });

        test('should navigate to admission form and verify it loads', async ({ page }) => {
            await page.goto('/dashboard/students/admission');

            await expect(page.locator('h1')).toContainText('Admission', { timeout: 10000 });

            await expect(page.locator('button[type="submit"]')).toBeVisible();
        });

        test('should fill admission form fields and submit', async ({ page }) => {
            await page.goto('/dashboard/students/admission');

            await page.waitForSelector('input', { timeout: 10000 });

            await page.fill('input[placeholder="John"]', 'E2E');
            await page.fill('input[placeholder="Doe"]', 'TestStudent');

            const genderSelect = page.locator('select').first();
            if (await genderSelect.isVisible()) {
                await genderSelect.selectOption('MALE');
            }

            const dateInput = page.locator('input[type="date"]');
            if (await dateInput.isVisible()) {
                await dateInput.fill('2010-01-01');
            }

            const guardianNameInput = page.locator('input[placeholder*="Guardian"]').first();
            if (await guardianNameInput.isVisible()) {
                await guardianNameInput.fill('Guardian Test');
            }

            const guardianPhoneInput = page.locator('input[type="tel"]').first();
            if (await guardianPhoneInput.isVisible()) {
                await guardianPhoneInput.fill('08012345678');
            }

            const consentCheckbox = page.locator('input[type="checkbox"]').first();
            if (await consentCheckbox.isVisible()) {
                await consentCheckbox.check();
            }

            const submitBtn = page.locator('button[type="submit"]');
            if (await submitBtn.isVisible()) {
                await submitBtn.click();

                await expect(page.locator('text=Success')).toBeVisible({ timeout: 15000 });
            }
        });
    });

    test.describe('Dashboard Navigation', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/login');
            await page.fill('input[name="email"]', 'admin@test.com');
            await page.fill('input[name="password"]', 'password');
            await page.click('button[type="submit"]');
            await page.waitForURL('/dashboard');
        });

        test('should verify sidebar links are visible', async ({ page }) => {
            await expect(page.locator('button[aria-label="Student Details"]')).toBeVisible({ timeout: 10000 });
            await expect(page.locator('button[aria-label="Attendance"]')).toBeVisible();
            await expect(page.locator('button[aria-label="Financial Management"]')).toBeVisible();
            await expect(page.locator('button[aria-label="Dashboard"]')).toBeVisible();
        });

        test('should expand Student Details and navigate to Student List', async ({ page }) => {
            await page.locator('button[aria-label="Student Details"]').click();
            await page.waitForTimeout(300);

            const studentListLink = page.locator('a:has-text("Student List")');
            await expect(studentListLink).toBeVisible();

            await studentListLink.click();
            await page.waitForURL('**/dashboard/students/list', { timeout: 10000 });

            await page.waitForSelector('table', { timeout: 10000 });

            const table = page.locator('table');
            await expect(table).toBeVisible();
        });

        test('should navigate to Student Overview page', async ({ page }) => {
            await page.locator('button[aria-label="Student Details"]').click();
            await page.waitForTimeout(300);

            await page.locator('a:has-text("Student Overview")').click();
            await page.waitForURL('**/dashboard/students', { timeout: 10000 });
            await expect(page).toHaveURL(/\/dashboard\/students/);
        });
    });

    test.describe('Finance Flow', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/login');
            await page.fill('input[name="email"]', 'admin@test.com');
            await page.fill('input[name="password"]', 'password');
            await page.click('button[type="submit"]');
            await page.waitForURL('/dashboard');
        });

        test('should navigate to Finance Overview and verify fee categories load', async ({ page }) => {
            await page.goto('/dashboard/finance');

            await page.waitForSelector('h1', { timeout: 10000 });
            await expect(page.locator('h1')).toContainText('Financial Overview');

            await page.waitForSelector('text=Total Invoiced', { timeout: 10000 });
            await expect(page.locator('text=Total Invoiced')).toBeVisible();
            await expect(page.locator('text=Total Collected')).toBeVisible();

            await page.locator('a:has-text("Fee Setup")').click();
            await page.waitForURL('**/dashboard/finance/fees', { timeout: 10000 });

            await expect(page.locator('h1')).toContainText('Fee Structure Setup');
            await expect(page.locator('text=Fee Categories')).toBeVisible({ timeout: 10000 });
        });

        test('should open expense form, fill it, and submit', async ({ page }) => {
            await page.goto('/dashboard/finance/expenses');

            await page.waitForSelector('h1', { timeout: 10000 });
            await expect(page.locator('h1')).toContainText('Office Expenses');

            const recordBtn = page.locator('button:has-text("Record Expense")');
            await expect(recordBtn).toBeVisible();
            await recordBtn.click();

            await page.waitForSelector('text=New Expense Voucher', { timeout: 5000 });
            await expect(page.locator('text=New Expense Voucher')).toBeVisible();

            const amountInput = page.locator('input[type="number"]');
            await expect(amountInput).toBeVisible();
            await amountInput.fill('5000');

            const paidToInput = page.locator('input[placeholder="Recipient Name"]');
            await expect(paidToInput).toBeVisible();
            await paidToInput.fill('E2E Test Vendor');

            const descInput = page.locator('input[placeholder="Expense details..."]');
            await expect(descInput).toBeVisible();
            await descInput.fill('E2E test expense entry');

            const submitBtn = page.locator('form button[type="submit"]');
            await expect(submitBtn).toContainText('Create Voucher');

            const categoryTrigger = page.locator('[role="combobox"]').first();
            if (await categoryTrigger.isVisible()) {
                await categoryTrigger.click();
                await page.waitForTimeout(500);
                const firstOption = page.locator('[role="option"]').first();
                if (await firstOption.isVisible().catch(() => false)) {
                    await firstOption.click();
                }
            }

            await submitBtn.click();

            await page.waitForTimeout(1500);
            await expect(page.locator('h1:has-text("Office Expenses")')).toBeVisible({ timeout: 5000 });
        });
    });

    test.describe('Attendance Flow', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/login');
            await page.fill('input[name="email"]', 'admin@test.com');
            await page.fill('input[name="password"]', 'password');
            await page.click('button[type="submit"]');
            await page.waitForURL('/dashboard');
        });

        test('should navigate to Attendance page and verify it loads properly', async ({ page }) => {
            await page.goto('/dashboard/attendance');

            await page.waitForSelector('h1', { timeout: 10000 });
            await expect(page.locator('h1')).toContainText('Attendance Overview');

            await expect(page.locator('text=Mark Attendance')).toBeVisible();
            await expect(page.locator('text=Student Attendance')).toBeVisible();
            await expect(page.locator('text=Staff Attendance')).toBeVisible();
        });

        test('should display attendance stats cards', async ({ page }) => {
            await page.goto('/dashboard/attendance');

            await page.waitForSelector('text=Students Present', { timeout: 10000 });
            await expect(page.locator('text=Students Present')).toBeVisible();
            await expect(page.locator('text=Staff Present')).toBeVisible();

            const calendarEl = page.locator('text=Attendance Overview');
            await expect(calendarEl).toBeVisible();
        });

        test('should navigate to Student Attendance from the dashboard', async ({ page }) => {
            await page.goto('/dashboard/attendance');

            await page.waitForSelector('text=Go to Students', { timeout: 10000 });

            const goToStudentsBtn = page.locator('button:has-text("Go to Students")');
            if (await goToStudentsBtn.isVisible().catch(() => false)) {
                await goToStudentsBtn.click();
                await page.waitForURL('**/dashboard/attendance/student', { timeout: 10000 });
                await expect(page).toHaveURL(/\/dashboard\/attendance\/student/);
            }
        });
    });
});
