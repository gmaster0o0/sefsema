"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { deleteRecipeAction, updateRecipeAction } from "../actions/recipes";
import type { Recipe } from "../lib/store";
import { useRecipeFilters } from "../hooks/useRecipeFilters";
import RecipeCard from "./RecipeCard";
import FilterSidebar from "./FilterSidebar";
import TagSelector from "./TagSelector";

type RecipeListProps = {
  publicRecipes: Recipe[];
  userRecipes: Recipe[];
  currentUser: { id: string; username: string; role: string } | null | undefined;
};

export default function RecipeList({ publicRecipes, userRecipes, currentUser }: RecipeListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [localUserRecipes, setLocalUserRecipes] = useState<Recipe[]>(userRecipes);
  const [error, setError] = useState<string | null>(null);
  const [editingTags, setEditingTags] = useState<string[]>([]);
  const router = useRouter();

  // Szinkronizáljuk a local state-et a prop változásával
  useEffect(() => {
    setLocalUserRecipes(userRecipes);
  }, [userRecipes]);

  // Összes recept kombinálása a szűréshez
  const allRecipes = useMemo(() => [...publicRecipes, ...localUserRecipes], [publicRecipes, localUserRecipes]);

  // Custom hook a szűréshez
  const {
    tagFilters,
    ingredientFilters,
    ingredientSearch,
    showSuggestions,
    showFilters,
    searchInputRef,
    suggestionsRef,
    suggestions,
    visibleRecipes,
    toggleFilterTag,
    addIngredientFilter,
    removeIngredientFilter,
    handleIngredientSearchChange,
    handleFilterToggle,
    setShowSuggestions,
  } = useRecipeFilters(allRecipes);

  useEffect(() => {
    const current = localUserRecipes.find((recipe) => recipe.id === editingId);
    setEditingTags(current?.tags ?? []);
  }, [editingId, localUserRecipes]);

  const toggleEditingTag = (tag: string) => {
    setEditingTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

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

  const isOwnRecipe = (recipe: Recipe) => !!currentUser && recipe.userId === currentUser.id;

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
          <div className="md:col-span-2">
            <input type="hidden" name="tags" value={editingTags.join(", ")} />
            <TagSelector selectedTags={editingTags} onToggle={toggleEditingTag} variant="edit" />
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
          <FilterSidebar
            tagFilters={tagFilters}
            onToggleTag={toggleFilterTag}
            ingredientFilters={ingredientFilters}
            ingredientSearch={ingredientSearch}
            onIngredientSearchChange={handleIngredientSearchChange}
            onAddIngredient={addIngredientFilter}
            onRemoveIngredient={removeIngredientFilter}
            suggestions={suggestions}
            showSuggestions={showSuggestions}
            searchInputRef={searchInputRef}
            suggestionsRef={suggestionsRef}
            onFocusSearch={() => ingredientSearch.trim() && setShowSuggestions(true)}
          />
          <div className="flex-1">
            {visibleRecipes.length === 0 ? (
              <p className="text-sm text-zinc-500">Nincs találat a kiválasztott szűrőkre.</p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    isOwn={isOwnRecipe(recipe)}
                    onEdit={() => setEditingId(recipe.id)}
                    onDelete={() => handleDelete(recipe.id)}
                  />
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
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isOwn={isOwnRecipe(recipe)}
                  onEdit={() => setEditingId(recipe.id)}
                  onDelete={() => handleDelete(recipe.id)}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
