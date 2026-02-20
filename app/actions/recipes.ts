"use server";

import { z } from "zod";

import { getCurrentUser } from "../lib/auth";
import { memoryRecipeRepo } from "../lib/store";
import { generateUniqueSlug } from "../lib/slug";

export type RecipeState = {
  ok: boolean;
  message: string;
};

const recipeSchema = z.object({
  title: z.string().min(3).max(120),
  imageUrl: z.string().optional(),
  ingredients: z.string().optional(),
  preparation: z.string().min(5),
  tags: z.string().optional(),
  isPublic: z.string().optional(),
});

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function generateImageUrl(title: string): string {
  // Use a random food image from Unsplash
  const foodImages = [
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop",
  ];
  const randomIndex = Math.abs(title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % foodImages.length;
  return foodImages[randomIndex];
}

export async function createRecipeAction(_prevState: RecipeState, formData: FormData): Promise<RecipeState> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { ok: false, message: "You must be signed in to create recipes." };
  }

  const candidate = {
    title: getString(formData, "title"),
    imageUrl: getString(formData, "imageUrl"),
    ingredients: getString(formData, "ingredients"),
    preparation: getString(formData, "preparation"),
    tags: getString(formData, "tags"),
    isPublic: formData.get("isPublic") ? "on" : undefined,
  };

  const parsed = recipeSchema.safeParse(candidate);
  if (!parsed.success) {
    return { ok: false, message: "Invalid input. Check title and image URL." };
  }

  const ingredientsList = parsed.data.ingredients
    ? parsed.data.ingredients
        .split("\n")
        .map((ing) => ing.trim())
        .filter((ing) => ing.length > 0)
    : [];

  const tagsList = parsed.data.tags
    ? parsed.data.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
    : [];

  const imageUrl = parsed.data.imageUrl || generateImageUrl(parsed.data.title);

  // Egyedi slug generálása
  const slug = await generateUniqueSlug(parsed.data.title, async (candidateSlug) => {
    const existing = await memoryRecipeRepo.findBySlug(candidateSlug);
    return existing !== null;
  });

  await memoryRecipeRepo.createRecipe({
    userId: currentUser.id,
    title: parsed.data.title,
    slug,
    imageUrl,
    ingredients: ingredientsList,
    preparation: parsed.data.preparation,
    tags: tagsList,
    isPublic: Boolean(parsed.data.isPublic),
  });

  return { ok: true, message: "Recipe created." };
}

export async function updateRecipeAction(formData: FormData): Promise<void> {
  const id = getString(formData, "id");
  if (!id) {
    return;
  }

  // A jelenlegi recept adatainak lekérése
  const currentRecipe = await memoryRecipeRepo.listRecipes().then((recipes) => recipes.find((r) => r.id === id));
  if (!currentRecipe) {
    return;
  }

  const candidate = {
    title: getString(formData, "title"),
    imageUrl: getString(formData, "imageUrl"),
    ingredients: getString(formData, "ingredients"),
    preparation: getString(formData, "preparation"),
    tags: getString(formData, "tags"),
    isPublic: formData.get("isPublic") ? "on" : undefined,
  };

  const parsed = recipeSchema.safeParse(candidate);
  if (!parsed.success) {
    return;
  }

  const ingredientsList = parsed.data.ingredients
    ? parsed.data.ingredients
        .split("\n")
        .map((ing) => ing.trim())
        .filter((ing) => ing.length > 0)
    : [];

  const tagsList = parsed.data.tags
    ? parsed.data.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
    : [];

  const imageUrl = parsed.data.imageUrl || generateImageUrl(parsed.data.title);

  // Egyedi slug generálása (az aktuális slug figyelembevételével)
  const slug = await generateUniqueSlug(
    parsed.data.title,
    async (candidateSlug) => {
      const existing = await memoryRecipeRepo.findBySlug(candidateSlug);
      // Ha a talált recept az aktuális recept, az nem ütközés
      return existing !== null && existing.id !== id;
    },
    currentRecipe.slug,
  );

  await memoryRecipeRepo.updateRecipe(id, {
    title: parsed.data.title,
    slug,
    imageUrl,
    ingredients: ingredientsList,
    preparation: parsed.data.preparation,
    tags: tagsList,
    isPublic: Boolean(parsed.data.isPublic),
  });
}

export async function deleteRecipeAction(formData: FormData): Promise<void> {
  const id = getString(formData, "id");
  if (!id) {
    return;
  }

  await memoryRecipeRepo.deleteRecipe(id);
}
