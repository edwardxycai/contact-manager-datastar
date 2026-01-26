import { test, expect } from '@playwright/test';

test.describe('Contact Manager (Datastar)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/contacts');
  });

  test('loads contact list', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Contact Manager' })).toBeVisible();
    await expect(page.locator('#sidebar')).toContainText('John Doe');
    await expect(page.locator('#sidebar')).toContainText('Jane Smith');
  });

  test('view contact details', async ({ page }) => {
    await page.getByText('John Doe').click();

    await expect(page.locator('#content')).toContainText('John Doe');
    await expect(page.locator('#content')).toContainText('john.doe@example.com');
    await expect(page.getByRole('button', { name: 'Edit Contact' })).toBeVisible();
  });

  test('create new contact', async ({ page }) => {
    await page.getByRole('button', { name: 'New Contact' }).click();

    await expect(page.locator('#content')).toContainText('New Contact');

    await page.fill('#name', 'Playwright User');
    await page.fill('#email', 'playwright@example.com');

    await page.getByRole('button', { name: 'Submit' }).click();

    // Flash message
    await expect(page.locator('#content')).toContainText('Contact added.');

    // Sidebar updated
    await expect(page.locator('#sidebar')).toContainText('Playwright User');
  });

  test('edit existing contact', async ({ page }) => {
    await page.getByText('Jane Smith').click();
    await page.getByRole('button', { name: 'Edit Contact' }).click();

    await expect(page.locator('#content')).toContainText('Edit Contact');

    await page.fill('#name', 'Jane Smith Updated');
    await page.fill('#email', 'jane.updated@example.com');

    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.locator('#content')).toContainText('Contact updated.');
    await expect(page.locator('#content')).toContainText('Jane Smith Updated');

    // Sidebar reflects update
    await expect(page.locator('#sidebar')).toContainText('Jane Smith Updated');
  });

  test('delete contact', async ({ page }) => {
    await page.getByText('Emily Johnson').click();
    await page.getByRole('button', { name: 'Delete Contact' }).click();

    await expect(page.locator('#content')).toContainText(
      'Contact was successfully deleted!'
    );

    await expect(page.locator('#sidebar')).not.toContainText('Emily Johnson');
  });
});
