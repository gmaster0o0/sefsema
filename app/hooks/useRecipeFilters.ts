import { useEffect, useMemo, useRef, useState } from "react";
import type { Recipe } from "../lib/store";
import { getAllIngredients, filterIngredientSuggestions, recipeMatchesIngredients } from "../lib/ingredients";

export function useRecipeFilters(recipes: Recipe[]) {
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [ingredientFilters, setIngredientFilters] = useState<string[]>([]);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Kinyerjük az összes egyedi alapanyagot
  const allIngredients = useMemo(() => getAllIngredients(recipes), [recipes]);

  // Javaslatok szűrése
  const suggestions = useMemo(
    () => filterIngredientSuggestions(allIngredients, ingredientSearch, ingredientFilters),
    [allIngredients, ingredientSearch, ingredientFilters],
  );

  // Kattintás kezelése: bezárjuk a javaslatokat, ha kívülre kattintanak
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle függvények
  const toggleFilterTag = (tag: string) => {
    setTagFilters((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const addIngredientFilter = (ingredient: string) => {
    if (!ingredientFilters.includes(ingredient)) {
      setIngredientFilters((prev) => [...prev, ingredient]);
    }
    setIngredientSearch("");
    setShowSuggestions(false);
  };

  const removeIngredientFilter = (ingredient: string) => {
    setIngredientFilters((prev) => prev.filter((i) => i !== ingredient));
  };

  const handleIngredientSearchChange = (value: string) => {
    setIngredientSearch(value);
    setShowSuggestions(value.trim().length > 0);
  };

  const handleFilterToggle = () => {
    if (showFilters) {
      setTagFilters([]);
      setIngredientFilters([]);
      setIngredientSearch("");
      setShowFilters(false);
      return;
    }
    setShowFilters(true);
  };

  // Szűrési függvény
  const filterRecipes = (recipesToFilter: Recipe[]) => {
    // Ha nincs filter, minden recept látszik
    if (tagFilters.length === 0 && ingredientFilters.length === 0) {
      return recipesToFilter;
    }

    return recipesToFilter.filter((recipe) => {
      // Ha csak tag filter van
      if (tagFilters.length > 0 && ingredientFilters.length === 0) {
        return tagFilters.some((tag) => (recipe.tags ?? []).includes(tag));
      }

      // Ha csak ingredient filter van
      if (tagFilters.length === 0 && ingredientFilters.length > 0) {
        return recipeMatchesIngredients(recipe, ingredientFilters);
      }

      // Ha mindkettő van - OR logika: tag VAGY ingredient egyezés elég
      const tagMatch = tagFilters.some((tag) => (recipe.tags ?? []).includes(tag));
      const ingredientMatch = recipeMatchesIngredients(recipe, ingredientFilters);
      return tagMatch || ingredientMatch;
    });
  };

  // Szűrt receptek
  const visibleRecipes = filterRecipes(recipes);

  return {
    // State
    tagFilters,
    ingredientFilters,
    ingredientSearch,
    showSuggestions,
    showFilters,

    // Refs
    searchInputRef,
    suggestionsRef,

    // Computed values
    suggestions,
    visibleRecipes,

    // Actions
    toggleFilterTag,
    addIngredientFilter,
    removeIngredientFilter,
    handleIngredientSearchChange,
    handleFilterToggle,
    filterRecipes,
    setShowSuggestions,
  };
}
