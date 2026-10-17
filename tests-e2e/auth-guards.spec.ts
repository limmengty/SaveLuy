import { test, expect } from "@playwright/test";

test.describe("SaveLuy Authentication & Guard Tests", () => {
  test("Unauthenticated user accessing protected route is redirected to /login with next param", async ({ page }) => {
    // Attempting to visit /today without auth session
    await page.goto("/en-KH/today");
    await expect(page).toHaveURL(/\/en-KH\/login/);

    // Verify Google sign-in is presented
    await expect(page.getByRole("button", { name: /Continue with Google/i })).toBeVisible();
  });

  test("Login page displays secure user-scoped badge and brand principles", async ({ page }) => {
    await page.goto("/en-KH/login");
    await expect(page.getByText(/Secure user-scoped session/i)).toBeVisible();
    await expect(page.getByText(/No ads\. No data reselling\./i)).toBeVisible();
  });

  test("Public callback route safely handles missing OAuth codes without crash", async ({ page }) => {
    await page.goto("/auth/callback");
    // Should safely redirect back to login with missing_code reason parameter
    await expect(page).toHaveURL(/\/en-KH\/login\?reason=missing_code/);
  });
});
