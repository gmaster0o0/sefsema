import { describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRecipeFilters } from "../../app/hooks/useRecipeFilters";
import type { Recipe } from "../../app/lib/store";

const makeRecipe = (id: string, tags: string[], ingredients: string[]): Recipe => ({
  id,
  userId: "user-1",
  title: `Recipe ${id}`,
  slug: `recipe-${id}`,
  imageUrl: "",
  ingredients,
  preparation: "Test preparation",
  tags,
  isPublic: true,
  createdAt: "2026-02-21T00:00:00.000Z",
});

describe("useRecipeFilters", () => {
  it("initializes with empty filters", () => {
    const recipes = [makeRecipe("1", ["Vegan"], ["tofu"])];
    const { result } = renderHook(() => useRecipeFilters(recipes));

    expect(result.current.tagFilters).toEqual([]);
    expect(result.current.ingredientFilters).toEqual([]);
    expect(result.current.visibleRecipes).toHaveLength(1);
  });

  it("filters by tag", () => {
    const recipes = [makeRecipe("1", ["Vegan"], ["tofu"]), makeRecipe("2", ["Vegetáriánus"], ["cheese"])];

    const { result } = renderHook(() => useRecipeFilters(recipes));

    act(() => {
      result.current.toggleFilterTag("Vegan");
    });

    expect(result.current.tagFilters).toEqual(["Vegan"]);
    expect(result.current.visibleRecipes).toHaveLength(1);
    expect(result.current.visibleRecipes[0].id).toBe("1");
  });

  it("filters by ingredient", () => {
    const recipes = [makeRecipe("1", [], ["2 g tofu", "rice"]), makeRecipe("2", [], ["3 kg cheese"])];

    const { result } = renderHook(() => useRecipeFilters(recipes));

    act(() => {
      result.current.addIngredientFilter("tofu");
    });

    expect(result.current.ingredientFilters).toEqual(["tofu"]);
    expect(result.current.visibleRecipes).toHaveLength(1);
    expect(result.current.visibleRecipes[0].id).toBe("1");
  });

  it("combines tag and ingredient filters (OR)", () => {
    const recipes = [
      makeRecipe("1", ["Vegan"], ["tofu"]),
      makeRecipe("2", ["Vegetáriánus"], ["cheese"]),
      makeRecipe("3", ["Vegan"], ["rice"]),
    ];

    const { result } = renderHook(() => useRecipeFilters(recipes));

    act(() => {
      result.current.toggleFilterTag("Vegan");
      result.current.addIngredientFilter("cheese");
    });

    // OR logika: Vegan VAGY cheese → receptek 1, 2, 3
    expect(result.current.visibleRecipes).toHaveLength(3);
    expect(result.current.visibleRecipes.map((r) => r.id).sort()).toEqual(["1", "2", "3"]);
  });

  it("clears filters when toggling off", () => {
    const recipes = [makeRecipe("1", ["Vegan"], ["tofu"])];
    const { result } = renderHook(() => useRecipeFilters(recipes));

    act(() => {
      result.current.toggleFilterTag("Vegan");
      result.current.addIngredientFilter("tofu");
      result.current.handleFilterToggle(); // show filters
    });

    expect(result.current.showFilters).toBe(true);

    act(() => {
      result.current.handleFilterToggle(); // hide filters
    });

    expect(result.current.showFilters).toBe(false);
    expect(result.current.tagFilters).toEqual([]);
    expect(result.current.ingredientFilters).toEqual([]);
  });
});
