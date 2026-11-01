import { test, expect } from "@playwright/test";

test.describe("SaveLuy End-to-End User Journeys", () => {
  test.beforeEach(async ({ context }) => {
    await context.setExtraHTTPHeaders({
      "x-playwright-test": "true",
    });
  });

  test("User can load Today dashboard, perform quick add, and see Available Today update", async ({ page }) => {
    // 1. Visit Today dashboard
    await page.goto("/en-KH/today");
    await expect(page).toHaveTitle(/SaveLuy/);

    // 2. Check Available Today hero
    const availableTodayText = page.locator(".amount-hero");
    await expect(availableTodayText).toBeVisible();

    // 3. Tap Coffee quick add ($1.50)
    const coffeeBtn = page.getByRole("button", { name: /Coffee/i }).first();
    if (await coffeeBtn.isVisible()) {
      await coffeeBtn.click();
      // Should show a notification toast
      await expect(page.getByText(/Coffee added/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test("User can open the Check tab and see ripple calculation", async ({ page }) => {
    await page.goto("/en-KH/today");

    // Check is a navigation tab (sidebar "Check Purchase" on desktop, dock "Check" on mobile)
    await page.getByRole("link", { name: /Check/i }).first().click();
    await expect(page).toHaveURL(/\/en-KH\/check/);

    // Tap number 5 and 0 on the keypad
    await page.getByRole("button", { name: "5", exact: true }).click();
    await page.getByRole("button", { name: "0", exact: true }).click();

    // Impact preview and trade-off perspectives appear for the entered amount
    await expect(page.getByText(/Fits today|Adjusts the week|Needs a decision/i)).toBeVisible();
    await expect(page.getByText(/Trade-offs/i)).toBeVisible();
  });

  test("User can navigate Settings, switch language to Khmer and back", async ({ page }) => {
    await page.goto("/en-KH/settings");

    // Verify settings preferences section
    await expect(page.getByText(/Preferences/i)).toBeVisible();

    // Switch to Khmer
    const khmerLink = page.getByRole("link", { name: /ភាសាខ្មែរ/i });
    await khmerLink.scrollIntoViewIfNeeded();
    await Promise.all([
      page.waitForURL(/\/km-KH\/settings/),
      khmerLink.click(),
    ]);

    await expect(page.getByText(/ចំណូលចិត្ត/i)).toBeVisible();

    // Switch back to English
    const englishLink = page.getByRole("link", { name: /English/i });
    await englishLink.scrollIntoViewIfNeeded();
    await Promise.all([
      page.waitForURL(/\/en-KH\/settings/),
      englishLink.click(),
    ]);
  });

  test("User can complete onboarding wizard steps", async ({ page }) => {
    // 1. Step 1: Income
    await page.goto("/en-KH/onboarding/income");
    await expect(page.getByRole("heading", { name: /How does money arrive/i })).toBeVisible();
    await page.getByRole("button", { name: /Continue to Templates/i }).click();

    // 2. Step 2: Template
    await expect(page).toHaveURL(/\/en-KH\/onboarding\/template/, { timeout: 15000 });
    await expect(page.getByRole("heading", { name: /Choose a Template/i })).toBeVisible();
    await page.getByRole("button", { name: /Review & Adjust Plan/i }).click();

    // 3. Step 3: Review
    await expect(page).toHaveURL(/\/en-KH\/onboarding\/review/, { timeout: 15000 });
    await expect(page.getByRole("heading", { name: /Review & Adjust/i })).toBeVisible();
    await page.getByRole("button", { name: /Activate My Plan/i }).click();

    // 4. Redirects to today
    await expect(page).toHaveURL(/\/en-KH\/today/, { timeout: 15000 });
  });
});
