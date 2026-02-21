import { describe, expect, it } from "vitest";
import {
  filterIngredientSuggestions,
  getAllIngredients,
  normalizeIngredient,
  recipeMatchesIngredients,
} from "../../app/lib/ingredients";
import type { Recipe } from "../../app/lib/store";

const makeRecipe = (ingredients: string[]): Recipe => ({
  id: "seed-1",
  userId: "seed-user",
  title: "Sample",
  slug: "sample",
  imageUrl: "",
  ingredients,
  preparation: "",
  tags: [],
  isPublic: true,
  createdAt: "2026-02-21T00:00:00.000Z",
});

describe("normalizeIngredient", () => {
  it("strips quantity and units", () => {
    expect(normalizeIngredient("2 g sugar")).toBe("sugar");
  });

  it("normalizes single word", () => {
    expect(normalizeIngredient("Sugar")).toBe("sugar");
  });
});

describe("getAllIngredients", () => {
  it("deduplicates normalized ingredients", () => {
    const recipes = [makeRecipe(["2 g sugar", "1 kg flour"]), makeRecipe(["sugar"])];

    expect(getAllIngredients(recipes)).toEqual(["flour", "sugar"]);
  });
});

describe("filterIngredientSuggestions", () => {
  it("filters by search term and excludes selected", () => {
    const allIngredients = ["sugar", "salt", "flour"];

    expect(filterIngredientSuggestions(allIngredients, "su", [])).toEqual(["sugar"]);
    expect(filterIngredientSuggestions(allIngredients, "s", ["sugar"])).toEqual(["salt"]);
  });
});

describe("recipeMatchesIngredients", () => {
  it("matches when any selected ingredient is present", () => {
    const recipe = makeRecipe(["2 g sugar", "1 kg flour"]);

    expect(recipeMatchesIngredients(recipe, ["sugar"])).toBe(true);
    expect(recipeMatchesIngredients(recipe, ["salt"])).toBe(false);
  });
});
