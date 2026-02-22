import React, { useEffect } from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useRecipeFilters } from "../../app/hooks/useRecipeFilters";
import type { Recipe } from "../../app/lib/store";

function TestComp({
  recipes,
  currentUserId,
  initialOnlyOwn,
  initialOnlyPublic,
}: {
  recipes: Recipe[];
  currentUserId?: string | null;
  initialOnlyOwn?: boolean;
  initialOnlyPublic?: boolean;
}) {
  const { visibleRecipes, setOnlyOwn, setOnlyPublic } = useRecipeFilters(recipes, {
    currentUserId,
  });

  useEffect(() => {
    if (typeof setOnlyOwn === "function") setOnlyOwn(Boolean(initialOnlyOwn));
    if (typeof setOnlyPublic === "function") setOnlyPublic(Boolean(initialOnlyPublic));
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div data-testid="count">{visibleRecipes.length}</div>;
}

describe("visibility filters (unit)", () => {
  const seedUserId = "seed-user-1";

  const sampleRecipes: Recipe[] = [
    // two public system recipes
    {
      id: "s1",
      userId: "system",
      title: "A",
      slug: "a",
      imageUrl: "",
      ingredients: [],
      preparation: "",
      tags: [],
      isPublic: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "s2",
      userId: "system",
      title: "B",
      slug: "b",
      imageUrl: "",
      ingredients: [],
      preparation: "",
      tags: [],
      isPublic: true,
      createdAt: new Date().toISOString(),
    },
    // one public recipe owned by seed user
    {
      id: "u1",
      userId: seedUserId,
      title: "U-PUB",
      slug: "u-pub",
      imageUrl: "",
      ingredients: [],
      preparation: "",
      tags: [],
      isPublic: true,
      createdAt: new Date().toISOString(),
    },
    // one private recipe owned by seed user
    {
      id: "u2",
      userId: seedUserId,
      title: "U-PRIV",
      slug: "u-priv",
      imageUrl: "",
      ingredients: [],
      preparation: "",
      tags: [],
      isPublic: false,
      createdAt: new Date().toISOString(),
    },
  ];

  it("shows union (all) when onlyOwn+onlyPublic are true", async () => {
    render(
      <TestComp recipes={sampleRecipes} currentUserId={seedUserId} initialOnlyOwn={true} initialOnlyPublic={true} />,
    );
    expect(screen.getByTestId("count").textContent).toBe("4");
  });

  afterEach(() => {
    cleanup();
  });

  it("shows only public when onlyPublic=true and onlyOwn=false", async () => {
    render(
      <TestComp recipes={sampleRecipes} currentUserId={seedUserId} initialOnlyOwn={false} initialOnlyPublic={true} />,
    );
    expect(screen.getByTestId("count").textContent).toBe("3");
  });

  it("shows only own when onlyOwn=true and onlyPublic=false", async () => {
    render(
      <TestComp recipes={sampleRecipes} currentUserId={seedUserId} initialOnlyOwn={true} initialOnlyPublic={false} />,
    );
    // two recipes belong to seed user (one public, one private)
    expect(screen.getByTestId("count").textContent).toBe("2");
  });

  it("guest sees only public by default (no currentUserId)", async () => {
    render(<TestComp recipes={sampleRecipes} currentUserId={null} initialOnlyOwn={false} initialOnlyPublic={true} />);
    expect(screen.getByTestId("count").textContent).toBe("3");
  });
});
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
    expect(result.current.visibleRecipes.map((r: Recipe) => r.id).sort()).toEqual(["1", "2", "3"]);
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
