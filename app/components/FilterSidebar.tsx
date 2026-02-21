"use client";

import type { RefObject } from "react";
import TagSelector from "./TagSelector";

type FilterSidebarProps = {
  // Tag filter props
  tagFilters: string[];
  onToggleTag: (tag: string) => void;

  // Ingredient filter props
  ingredientFilters: string[];
  ingredientSearch: string;
  onIngredientSearchChange: (value: string) => void;
  onAddIngredient: (ingredient: string) => void;
  onRemoveIngredient: (ingredient: string) => void;

  // Suggestions
  suggestions: string[];
  showSuggestions: boolean;
  searchInputRef: RefObject<HTMLInputElement | null>;
  suggestionsRef: RefObject<HTMLDivElement | null>;
  onFocusSearch: () => void;
};

export default function FilterSidebar({
  tagFilters,
  onToggleTag,
  ingredientFilters,
  ingredientSearch,
  onIngredientSearchChange,
  onAddIngredient,
  onRemoveIngredient,
  suggestions,
  showSuggestions,
  searchInputRef,
  suggestionsRef,
  onFocusSearch,
}: FilterSidebarProps) {
  return (
    <aside className="md:w-64 lg:w-72">
      <div className="rounded-2xl border border-black/10 bg-zinc-50 p-4">
        {/* Tag szűrő */}
        <TagSelector selectedTags={tagFilters} onToggle={onToggleTag} variant="filter" />

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
                    onClick={() => onRemoveIngredient(ingredient)}
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
              onChange={(e) => onIngredientSearchChange(e.target.value)}
              onFocus={onFocusSearch}
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
                    onClick={() => onAddIngredient(suggestion)}
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
  );
}
