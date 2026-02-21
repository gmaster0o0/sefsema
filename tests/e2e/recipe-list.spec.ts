import { expect, test } from "@playwright/test";

test("recipe list renders and filters open", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Receptek" })).toBeVisible();
  await expect(page.locator('a[href^="/recept/"]').first()).toBeVisible();

  await page.getByRole("button", { name: /Sz/ }).click();
  await expect(page.getByText(/Sz.r.s tagek alapj.n/)).toBeVisible();
  await expect(page.getByPlaceholder(/Alapanyag keres/)).toBeVisible();
});

test("tag filter narrows recipes", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /Sz/ }).click();
  await page.getByRole("button", { name: "Vegan" }).click();

  await expect(page.getByRole("link", { name: "Guacamole" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Margherita pizza" })).toHaveCount(0);
});
