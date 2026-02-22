import { useEffect, useMemo, useRef, useState } from "react";
import type { Recipe } from "../lib/store";
import { getAllIngredients, filterIngredientSuggestions, recipeMatchesIngredients } from "../lib/ingredients";

type UseRecipeFiltersOpts = {
  showFilters?: boolean;
  setShowFilters?: (v: boolean) => void;
  initialIngredientSearch?: string;
  currentUserId?: string | null;
};

export function useRecipeFilters(recipes: Recipe[], opts?: UseRecipeFiltersOpts) {
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [ingredientFilters, setIngredientFilters] = useState<string[]>([]);
  const [ingredientSearch, setIngredientSearch] = useState(opts?.initialIngredientSearch ?? "");
  const [showSuggestions, setShowSuggestions] = useState(Boolean((opts?.initialIngredientSearch ?? "").trim()));
  const [internalShowFilters, setInternalShowFilters] = useState(false);
  const showFilters = opts?.showFilters ?? internalShowFilters;
  const setShowFilters = opts?.setShowFilters ?? setInternalShowFilters;
  const currentUserId = opts?.currentUserId ?? null;
  const [onlyOwn, setOnlyOwn] = useState(() => Boolean(currentUserId));
  const [onlyPublic, setOnlyPublic] = useState<boolean>(true);
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

  // Sync when an external initial search value changes (e.g. header input)
  useEffect(() => {
    if (typeof opts?.initialIngredientSearch === "string") {
      setIngredientSearch(opts.initialIngredientSearch);
      setShowSuggestions(Boolean(opts.initialIngredientSearch.trim()));
    }
  }, [opts?.initialIngredientSearch]);

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
      setOnlyOwn(false);
      setShowFilters(false);
      return;
    }
    setShowFilters(true);
  };

  // Szűrési függvény
  const filterRecipes = (recipesToFilter: Recipe[]) => {
    // Apply ownership/public filters when requested
    let working = recipesToFilter;
    if (onlyOwn || onlyPublic) {
      working = working.filter((r) => {
        const ownMatch = onlyOwn && currentUserId ? r.userId === currentUserId : false;
        const publicMatch = onlyPublic ? r.isPublic : false;
        return ownMatch || publicMatch;
      });
    }

    // If no tag/ingredient filters, return current working set
    if (tagFilters.length === 0 && ingredientFilters.length === 0) {
      return working;
    }

    return working.filter((recipe) => {
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
    onlyOwn,
    onlyPublic,
    setOnlyOwn,
    setOnlyPublic,
    filterRecipes,
    setShowSuggestions,
  };
}
