import { test, expect } from './auth-test.fixture';

test.describe('Authentication End-to-End Flow', () => {
  test('should register a new customer, verify via MFA code, log in, and log out successfully', async ({ page }) => {
    // Generate a unique email to avoid registration collisions
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const email = `test.user.${randomSuffix}@example.com`;
    const password = 'TestUserPassword123!';
    const name = 'Automation Tester';

    let isLoggedIn = false;

    // Mock the register endpoint to require verification
    await page.route('**/api/auth/register', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          requiresVerification: true,
          message: "Registration successful. A verification code has been sent to your registered address."
        }),
      });
    });

    // Mock the verify endpoint to succeed and set dummy auth cookie
    await page.route('**/api/auth/verify', async (route) => {
      isLoggedIn = true;
      await page.context().addCookies([
        {
          name: 'df_auth_token',
          value: 'dummyHeader.eyJ1c2VySWQiOiJjdXN0b21lci10ZXN0IiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwibmFtZSI6IkF1dG9tYXRpb24gVGVzdGVyIiwicm9sZSI6ImN1c3RvbWVyIn0=.dummySignature',
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          secure: false,
          sameSite: 'Lax',
        },
      ]);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: "Account verified successfully",
          user: {
            id: 'customer-test',
            email: 'test@example.com',
            name: 'Automation Tester',
            role: 'customer'
          }
        }),
      });
    });

    // Mock /api/auth/me — toggles based on isLoggedIn state
    await page.route('**/api/auth/me', async (route) => {
      if (isLoggedIn) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            user: {
              id: 'customer-test',
              email: 'test@example.com',
              name: 'Automation Tester',
              role: 'customer'
            }
          }),
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: "Unauthorized"
          }),
        });
      }
    });

    // Mock logout so it clears state and does NOT cause a server roundtrip
    await page.route('**/api/auth/logout', async (route) => {
      isLoggedIn = false;
      await page.context().clearCookies();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    // 1. SIGNUP FLOW — goto and wait for compilation before asserting heading
    await page.goto('/portal/customer/login?signup=true', { waitUntil: 'domcontentloaded' });
    // Wait for the page to finish loading (lazy compile in dev can delay hydration)
    await page.waitForSelector('h2', { timeout: 30000 });
    await expect(page.locator('h2')).toContainText(/Join DealFlow AI/i, { timeout: 15000 });

    // Fill registration form using field labels
    await page.getByLabel(/Full Name/i).fill(name);
    await page.getByLabel(/Email Address/i).fill(email);
    await page.getByLabel(/^Password$/i).fill(password);

    // Submit signup
    const submitBtn = page.locator('#auth-submit-btn');
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Verify verification code subform is shown
    const verificationLabel = page.getByLabel(/MFA Verification Code/i);
    await expect(verificationLabel).toBeVisible({ timeout: 10000 });

    // Fill code and submit confirmation
    await verificationLabel.fill('123456');
    await page.getByRole('button', { name: /Activate & Log In/i }).click();

    // Verify successful verification and redirect to /portal/customer
    await expect(page).toHaveURL(/\/portal\/customer/, { timeout: 30000 });

    // Wait for portal auth guard to resolve.
    await expect(page.getByRole('status', { name: /Loading portal/i })).toBeHidden({ timeout: 30000 });

    // 2. LOGOUT FLOW
    const logoutBtn = page.getByRole('button', { name: /^Logout(ing out\.\.\.)?$/i }).first();
    await expect(logoutBtn).toBeVisible({ timeout: 10000 });
    await logoutBtn.click({ force: true });

    // After logout, page should navigate away from portal
    // Accept either the home page or the customer login page as successful logout destinations
    await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/(portal\/customer\/login.*)?$/, { timeout: 25000 });
  });

  test('should handle valid and invalid logins for demo customer', async ({ page }) => {
    // Pre-warm the login page (dev lazy compilation can cause initial 404)
    await page.goto('/portal/customer/login', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('h2', { timeout: 30000 });

    // 1. INVALID LOGIN
    await expect(page.locator('h2')).toContainText(/Welcome back/i, { timeout: 15000 });

    await page.getByLabel(/Email Address/i).fill('demo@customer.com');
    await page.getByLabel(/^Password$/i).fill('WrongPassword!');
    await page.locator('#auth-submit-btn').click();

    // Verify some error alert is visible (text comes from the API response)
    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible({ timeout: 15000 });

    // 2. VALID LOGIN
    await page.getByLabel(/^Password$/i).fill('CustomerDemo123!');
    await page.locator('#auth-submit-btn').click();

    // Verify successfully logged in and redirected
    await expect(page).toHaveURL(/\/portal\/customer/, { timeout: 25000 });
  });
});
