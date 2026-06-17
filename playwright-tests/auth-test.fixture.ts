import { test as base, Page } from '@playwright/test';

interface CustomFixtures {
  authenticatedAdmin: Page;
  authenticatedCustomer: Page;
  authenticatedAgent: Page;
}

// Extend base test with custom fixtures
export const test = base.extend<CustomFixtures>({
  // Fixture for authenticated admin user
  authenticatedAdmin: async ({ page, context }, use) => {
    // Set cookie with correct name matching lib/auth.ts AUTH_COOKIE_NAME = "df_auth_token"
    await context.addCookies([
      {
        name: 'df_auth_token',
        value: 'mock_admin_token',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      },
    ]);
    
    // Mock current user response — the server reads the cookie then validates JWT.
    // We bypass JWT validation by mocking the /api/auth/me endpoint.
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            id: 'demo-admin-1',
            name: 'DealFlow Admin',
            email: 'admin@dealflow.ai',
            role: 'admin',
          },
        }),
      });
    });

    await use(page);
  },
  
  // Fixture for authenticated customer user
  authenticatedCustomer: async ({ page, context }, use) => {
    await context.addCookies([
      {
        name: 'df_auth_token',
        value: 'mock_customer_token',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      },
    ]);
    
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            id: 'customer-demo',
            name: 'Demo Customer',
            email: 'demo@customer.com',
            role: 'customer',
          },
        }),
      });
    });

    await use(page);
  },
  
  // Fixture for authenticated agent user
  authenticatedAgent: async ({ page, context }, use) => {
    await context.addCookies([
      {
        name: 'df_auth_token',
        value: 'mock_agent_token',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      },
    ]);
    
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            id: 'agent-praneeth',
            name: 'Praneeth',
            email: 'praneeth@dealflow.ai',
            role: 'agent',
          },
        }),
      });
    });

    await use(page);
  },
});

export { expect } from '@playwright/test';
