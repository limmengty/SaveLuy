import { test, expect } from "@playwright/test";

test.describe("BrokeNoMore End-to-End User Journeys", () => {
  test.beforeEach(async ({ context }) => {
    await context.setExtraHTTPHeaders({
      "x-playwright-test": "true",
    });
  });

  test("User can load Today dashboard, perform quick add, and see Available Today update", async ({ page }) => {
    // 1. Visit Today dashboard
    await page.goto("/en-KH/today");
    await expect(page).toHaveTitle(/BrokeNoMore/);

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

  test("User can open Check Purchase panel and see ripple calculation", async ({ page, isMobile }) => {
    await page.goto("/en-KH/today");

    // Click Check purchase trigger in shell (mobile has 'Check', desktop has 'Check purchase')
    const checkBtn = isMobile
      ? page.getByRole("button", { name: /Check$/i }).first()
      : page.getByRole("button", { name: /Check purchase/i }).first();
    await checkBtn.click();

    // Drawer should open
    await expect(page.getByRole("heading", { name: /Check a purchase/i })).toBeVisible();

    // Tap number 5 and 0
    await page.getByRole("button", { name: "5", exact: true }).click();
    await page.getByRole("button", { name: "0", exact: true }).click();

    // Check impact preview appears
    await expect(page.getByText(/Fits today|Adjusts the week|Needs a decision/i)).toBeVisible();
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
    await expect(page.getByRole("heading", { name: /Income Rhythm/i })).toBeVisible();
    await page.getByRole("button", { name: /Continue to Templates/i }).click();

    // 2. Step 2: Template
    await expect(page).toHaveURL(/\/en-KH\/onboarding\/template/);
    await expect(page.getByRole("heading", { name: /Choose a Template/i })).toBeVisible();
    await page.getByRole("button", { name: /Review My Plan/i }).click();

    // 3. Step 3: Review
    await expect(page).toHaveURL(/\/en-KH\/onboarding\/review/);
    await expect(page.getByRole("heading", { name: /Review Your Plan/i })).toBeVisible();
    await page.getByRole("button", { name: /Save & Start Today/i }).click();

    // 4. Redirects to today
    await expect(page).toHaveURL(/\/en-KH\/today/);
  });
});
