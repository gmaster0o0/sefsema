"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Recipe } from "../lib/store";
import { TAG_GROUPS } from "../lib/tags";
import { getAllIngredients, filterIngredientSuggestions, recipeMatchesIngredients } from "../lib/ingredients";

type PublicRecipesProps = {
  recipes: Recipe[];
};

export default function PublicRecipes({ recipes }: PublicRecipesProps) {
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [ingredientFilters, setIngredientFilters] = useState<string[]>([]);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
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

  if (recipes.length === 0) {
    return <p className="mt-3 text-sm text-zinc-500">Még nincs publikus recept.</p>;
  }

  const toggleFilterTag = (tag: string) => {
    setTagFilters((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
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

  // Szűrés: tag ÉS alapanyag szűrők kombinálása
  let visibleRecipes = recipes;

  // Tag szűrés (OR logika)
  if (tagFilters.length > 0) {
    visibleRecipes = visibleRecipes.filter((recipe) => tagFilters.some((tag) => (recipe.tags ?? []).includes(tag)));
  }

  // Alapanyag szűrés (OR logika)
  if (ingredientFilters.length > 0) {
    visibleRecipes = visibleRecipes.filter((recipe) => recipeMatchesIngredients(recipe, ingredientFilters));
  }

  return (
    <div className="mt-4">
      <div className="mb-4 flex items-center">
        <div className="w-full md:w-64 lg:w-72">
          <button
            type="button"
            onClick={handleFilterToggle}
            className="flex w-full items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50"
          >
            {showFilters ? "Bezárás" : "Szűrők"}
            {showFilters ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M6 12h12m-6 6h6" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {showFilters ? (
        <div className="flex flex-col gap-6 md:flex-row">
          <aside className="md:w-64 lg:w-72">
            <div className="rounded-2xl border border-black/10 bg-zinc-50 p-4">
              {/* Tag szűrő */}
              <p className="mb-3 text-sm font-semibold text-zinc-700">Szűrés tagek alapján</p>
              <div className="grid gap-3">
                {TAG_GROUPS.map((group) => (
                  <div key={group.label} className="grid gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{group.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.tags.map((tag) => {
                        const isSelected = tagFilters.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleFilterTag(tag)}
                            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                              isSelected
                                ? "border-black bg-black text-white"
                                : "border-black/10 bg-white text-zinc-700 hover:bg-zinc-100"
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Alapanyag szűrő */}
              <div className="mt-6 border-t border-black/10 pt-4">
                <p className="mb-3 text-sm font-semibold text-zinc-700">Szűrés alapanyag alapján</p>

                {/* Kiválasztott alapanyagok */}
                {ingredientFilters.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {ingredientFilters.map((ingredient) => (
                      <span
                        key={ingredient}
                        className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                      >
                        {ingredient}
                        <button
                          type="button"
                          onClick={() => removeIngredientFilter(ingredient)}
                          className="hover:text-emerald-900"
                          aria-label={`${ingredient} eltávolítása`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="h-3 w-3"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Keresés mező */}
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Alapanyag keresése..."
                    value={ingredientSearch}
                    onChange={(e) => handleIngredientSearchChange(e.target.value)}
                    onFocus={() => ingredientSearch.trim() && setShowSuggestions(true)}
                    className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />

                  {/* Javaslatok */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div
                      ref={suggestionsRef}
                      className="absolute z-10 mt-1 w-full rounded-lg border border-black/10 bg-white shadow-lg"
                    >
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => addIngredientFilter(suggestion)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-50 first:rounded-t-lg last:rounded-b-lg"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <p className="mt-2 text-xs text-zinc-400">
                  Kezdd el gépelni az alapanyag nevét és válaszd ki a javaslatokból.
                </p>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            {visibleRecipes.length === 0 ? (
              <p className="text-sm text-zinc-500">Nincs találat a kiválasztott szűrőkre.</p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleRecipes.map((recipe) => (
                  <li key={recipe.id} className="overflow-hidden rounded-2xl border border-black/10 shadow-sm">
                    <Link href={`/recept/${recipe.slug}`} className="block transition-colors hover:bg-zinc-50">
                      {recipe.imageUrl ? (
                        <div className="relative h-48 w-full">
                          <Image src={recipe.imageUrl} alt={recipe.title} fill className="object-cover" unoptimized />
                        </div>
                      ) : (
                        <div className="h-48 w-full bg-gradient-to-br from-zinc-100 to-zinc-200" />
                      )}
                      <div className="p-4">
                        <p className="font-semibold text-zinc-900">{recipe.title}</p>
                        {recipe.ingredients.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-semibold text-zinc-600">Hozzávalók:</p>
                            <ul className="mt-1 text-xs text-zinc-500">
                              {recipe.ingredients.slice(0, 3).map((ingredient, idx) => (
                                <li key={idx} className="truncate">
                                  • {ingredient}
                                </li>
                              ))}
                              {recipe.ingredients.length > 3 && (
                                <li className="text-zinc-400">+ {recipe.ingredients.length - 3} további</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : visibleRecipes.length === 0 ? (
        <p className="text-sm text-zinc-500">Nincs találat a kiválasztott szűrőkre.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleRecipes.map((recipe) => (
            <li key={recipe.id} className="overflow-hidden rounded-2xl border border-black/10 shadow-sm">
              <Link href={`/recept/${recipe.slug}`} className="block transition-colors hover:bg-zinc-50">
                {recipe.imageUrl ? (
                  <div className="relative h-48 w-full">
                    <Image src={recipe.imageUrl} alt={recipe.title} fill className="object-cover" unoptimized />
                  </div>
                ) : (
                  <div className="h-48 w-full bg-gradient-to-br from-zinc-100 to-zinc-200" />
                )}
                <div className="p-4">
                  <p className="font-semibold text-zinc-900">{recipe.title}</p>
                  {recipe.ingredients.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-zinc-600">Hozzávalók:</p>
                      <ul className="mt-1 text-xs text-zinc-500">
                        {recipe.ingredients.slice(0, 3).map((ingredient, idx) => (
                          <li key={idx} className="truncate">
                            • {ingredient}
                          </li>
                        ))}
                        {recipe.ingredients.length > 3 && (
                          <li className="text-zinc-400">+ {recipe.ingredients.length - 3} további</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
