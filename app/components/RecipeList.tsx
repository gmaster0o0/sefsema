"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { deleteRecipeAction, updateRecipeAction } from "../actions/recipes";
import type { Recipe } from "../lib/store";
import { TAG_GROUPS } from "../lib/tags";
import { getAllIngredients, filterIngredientSuggestions, recipeMatchesIngredients } from "../lib/ingredients";

type RecipeListProps = {
  publicRecipes: Recipe[];
  userRecipes: Recipe[];
  currentUser: { id: string; username: string; role: string } | null | undefined;
};

export default function RecipeList({ publicRecipes, userRecipes, currentUser }: RecipeListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [localUserRecipes, setLocalUserRecipes] = useState<Recipe[]>(userRecipes);
  const [error, setError] = useState<string | null>(null);
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [editingTags, setEditingTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [ingredientFilters, setIngredientFilters] = useState<string[]>([]);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Összes recept kombinálása a szűréshez
  const allRecipes = useMemo(() => [...publicRecipes, ...localUserRecipes], [publicRecipes, localUserRecipes]);

  // Kinyerjük az összes egyedi alapanyagot
  const allIngredients = useMemo(() => getAllIngredients(allRecipes), [allRecipes]);

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

  useEffect(() => {
    const current = localUserRecipes.find((recipe) => recipe.id === editingId);
    setEditingTags(current?.tags ?? []);
  }, [editingId, localUserRecipes]);

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

  const toggleEditingTag = (tag: string) => {
    setEditingTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  // Szűrési függvény
  const filterRecipes = (recipes: Recipe[]) => {
    let visible = recipes;

    // Tag szűrés (OR logika)
    if (tagFilters.length > 0) {
      visible = visible.filter((recipe) => tagFilters.some((tag) => (recipe.tags ?? []).includes(tag)));
    }

    // Alapanyag szűrés (OR logika)
    if (ingredientFilters.length > 0) {
      visible = visible.filter((recipe) => recipeMatchesIngredients(recipe, ingredientFilters));
    }

    return visible;
  };

  // Minden recept szűrve - egyetlen lista
  const visibleRecipes = filterRecipes(allRecipes);

  const handleDelete = async (recipeId: string) => {
    const previousRecipes = localUserRecipes;
    setLocalUserRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    setError(null);

    try {
      const formData = new FormData();
      formData.append("id", recipeId);
      await deleteRecipeAction(formData);
      router.refresh();
    } catch (err) {
      setLocalUserRecipes(previousRecipes);
      setError("Hiba történt a recept törlése közben. Próbáld újra!");
      console.error("Delete error:", err);
    }
  };

  const handleUpdate = async (formData: FormData) => {
    setError(null);
    try {
      await updateRecipeAction(formData);
      setEditingId(null);
      router.refresh();
    } catch (err) {
      setError("Hiba történt a recept mentése közben. Próbáld újra!");
      console.error("Update error:", err);
    }
  };

  const isOwnRecipe = (recipe: Recipe) => currentUser && recipe.userId === currentUser.id;

  // Recept kártya komponens
  const RecipeCard = ({ recipe }: { recipe: Recipe }) => (
    <li
      key={recipe.id}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/10 shadow-sm"
    >
      <Link href={`/recept/${recipe.slug}`}>
        {recipe.imageUrl ? (
          <div className="relative h-48 w-full">
            <Image src={recipe.imageUrl} alt={recipe.title} fill className="object-cover" unoptimized />
          </div>
        ) : (
          <div className="h-48 w-full bg-gradient-to-br from-zinc-100 to-zinc-200" />
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/recept/${recipe.slug}`} className="mb-2 hover:text-zinc-600">
          <div className="flex items-start justify-between gap-2">
            <p className="flex-1 font-semibold text-zinc-900">{recipe.title}</p>
            <div className="flex flex-col gap-1">
              <span
                className={`flex-shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
                  recipe.isPublic ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-700"
                }`}
              >
                {recipe.isPublic ? "Publikus" : "Privát"}
              </span>
              {isOwnRecipe(recipe) && (
                <span className="flex-shrink-0 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                  Saját
                </span>
              )}
            </div>
          </div>
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
        </Link>
        {isOwnRecipe(recipe) && (
          <div className="mt-auto flex gap-2 pt-4">
            <button
              onClick={() => setEditingId(recipe.id)}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-sm font-medium hover:bg-zinc-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
              Szerkesztés
            </button>
            <button
              onClick={() => handleDelete(recipe.id)}
              className="rounded-lg border border-red-200 px-3 py-2 text-red-600 hover:bg-red-50"
              title="Törlés"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </li>
  );

  // Szerkesztő form
  const EditingForm = () => {
    const recipe = localUserRecipes.find((r) => r.id === editingId);
    if (!recipe) return null;

    return (
      <div className="mt-6 rounded-2xl border border-black/10 bg-zinc-50 p-6">
        <h3 className="mb-4 text-lg font-semibold">Recept szerkesztése</h3>
        <form action={handleUpdate} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="id" value={editingId ?? ""} />
          {recipe.imageUrl && (
            <div className="relative h-48 overflow-hidden rounded-lg md:col-span-2">
              <Image src={recipe.imageUrl} alt="Preview" fill className="object-cover" unoptimized />
            </div>
          )}
          <label className="grid gap-1 text-sm md:col-span-2">
            Cím
            <input
              name="title"
              defaultValue={recipe.title}
              className="rounded-lg border border-black/10 px-3 py-2"
              required
            />
          </label>
          <label className="grid gap-1 text-sm md:col-span-2">
            Kép URL
            <input
              name="imageUrl"
              type="url"
              defaultValue={recipe.imageUrl}
              className="rounded-lg border border-black/10 px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm md:col-span-2">
            Hozzávalók (soronként egy)
            <textarea
              name="ingredients"
              defaultValue={recipe.ingredients.join("\n")}
              className="min-h-32 rounded-lg border border-black/10 px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm md:col-span-2">
            Elkészítés
            <textarea
              name="preparation"
              defaultValue={recipe.preparation}
              className="min-h-32 rounded-lg border border-black/10 px-3 py-2"
              required
            />
          </label>
          <div className="grid gap-3 md:col-span-2">
            <p className="text-sm font-semibold">Tagek</p>
            <input type="hidden" name="tags" value={editingTags.join(", ")} />
            {TAG_GROUPS.map((group) => (
              <div key={group.label} className="grid gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{group.label}</p>
                <div className="flex flex-wrap gap-2">
                  {group.tags.map((tag) => {
                    const isSelected = editingTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleEditingTag(tag)}
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
            <p className="text-xs text-zinc-400">Több taget is kiválaszthatsz.</p>
          </div>
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input name="isPublic" type="checkbox" defaultChecked={recipe.isPublic} className="h-4 w-4" />
            Publikus recept (mindenki láthatja)
          </label>
          <div className="flex gap-3 md:col-span-2">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Mentés
            </button>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="rounded-lg border border-black/10 px-4 py-2 text-sm hover:bg-zinc-50"
            >
              Mégse
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Szűrő oldalsáv
  const FilterSidebar = () => (
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
  );

  return (
    <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">Receptek</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {currentUser
              ? "Böngészd a publikus recepteket és kezeld saját receptjeidet."
              : "Böngészd a publikus recepteket."}
          </p>
        </div>
        {!currentUser && (
          <Link
            href="/auth"
            className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            Bejelentkezés
          </Link>
        )}
      </div>

      {/* Hibaüzenet */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-5 w-5 flex-shrink-0 text-red-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">Hiba</p>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="rounded-lg p-1 text-red-600 hover:bg-red-100"
              aria-label="Bezárás"
            >
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
            </button>
          </div>
        </div>
      )}

      {/* Szerkesztő form */}
      {editingId && <EditingForm />}

      {/* Szűrő gomb */}
      {allRecipes.length > 0 && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleFilterToggle}
            className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50"
          >
            {showFilters ? (
              <>
                Bezárás
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
              </>
            ) : (
              <>
                Szűrők
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 4a1 1 0 00-1 1v2.586a1 1 0 00.293.707l6.414 6.414v7.586a1 1 0 001 1h2a1 1 0 001-1v-7.586l6.414-6.414A1 1 0 0021 7.586V5a1 1 0 00-1-1h-18z"
                  />
                </svg>
              </>
            )}
          </button>
        </div>
      )}

      {/* Receptek megjelenítése */}
      {allRecipes.length === 0 ? (
        <div className="mt-6 text-center">
          <p className="text-sm text-zinc-500">Még nincs recept.</p>
          {!currentUser && (
            <p className="mt-2 text-sm text-zinc-500">
              <Link href="/auth" className="font-semibold text-zinc-900">
                Jelentkezz be
              </Link>{" "}
              hogy létrehozhass saját recepteket.
            </p>
          )}
        </div>
      ) : showFilters ? (
        <div className="mt-4 flex flex-col gap-6 md:flex-row-reverse">
          <FilterSidebar />
          <div className="flex-1">
            {visibleRecipes.length === 0 ? (
              <p className="text-sm text-zinc-500">Nincs találat a kiválasztott szűrőkre.</p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-4">
          {visibleRecipes.length === 0 ? (
            <p className="text-sm text-zinc-500">Nincs találat a kiválasztott szűrőkre.</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
