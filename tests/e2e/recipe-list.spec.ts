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

  await expect(page.getByRole("link", { name: "Guacamole" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Margherita pizza" })).toHaveCount(0);
});

test("ingredient filter autocomplete and filters recipes", async ({ page }) => {
  await page.goto("/");

  // Open filters
  await page.getByRole("button", { name: /Sz/ }).click();

  // Type in ingredient search
  const searchInput = page.getByPlaceholder(/Alapanyag keres/);
  await searchInput.fill("lis");

  // Wait for suggestions to appear
  await expect(page.getByRole("button", { name: "liszt" })).toBeVisible();

  // Click on suggestion
  await page.getByRole("button", { name: "liszt" }).click();

  // Verify selected ingredient badge appears
  await expect(
    page.getByText("liszt").filter({ has: page.locator("button[aria-label*='eltávolítása']") }),
  ).toBeVisible();

  // Verify recipes with "liszt" are visible
  await expect(page.getByRole("link", { name: "Csokis keksz" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Palacsinta" }).first()).toBeVisible();

  // Verify recipes without "liszt" are not visible
  await expect(page.getByRole("link", { name: "Guacamole" })).toHaveCount(0);
});

test("recipe edit flow updates recipe", async ({ page }) => {
  // Login as maria
  await page.goto("/auth");
  await page.getByLabel("Email").fill("maria@example.com");
  await page.getByLabel("Password").fill("demo1234");
  await page.getByRole("button", { name: "Sign in" }).click();

  // Wait for redirect to home page
  await page.waitForURL("/");

  // Find maria's recipe "Citromos ricotta tészta"
  await expect(page.getByRole("link", { name: /Citromos ricotta/ }).first()).toBeVisible();

  // Click edit button on the recipe card
  const editButton = page.getByRole("button", { name: /Szerkeszt/ }).first();
  await editButton.click();

  // Wait for edit form to appear
  await expect(page.getByRole("heading", { name: /Recept szerkeszt/ })).toBeVisible();

  // Modify the title
  const titleInput = page.getByLabel("Cím");
  await titleInput.clear();
  await titleInput.fill("Citromos ricotta tészta - módosítva");

  // Save changes
  await page.getByRole("button", { name: "Mentés" }).click();

  // Wait for navigation to complete
  await page.waitForLoadState("networkidle");

  // Wait for form to close
  await expect(page.getByRole("heading", { name: /Recept szerkeszt/ })).not.toBeVisible();

  // Verify the updated title appears in the list
  await expect(page.getByRole("link", { name: /módosítva/ }).first()).toBeVisible();
});
