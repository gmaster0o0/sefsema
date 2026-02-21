import { memoryRecipeRepo } from "./store";
import type { RecipeRepository } from "./store";

const USE_MONGO = process.env.USE_MONGO === "true";

let recipeRepo: RecipeRepository | null = null;

export async function getRecipeRepo(): Promise<RecipeRepository> {
  if (recipeRepo) {
    return recipeRepo;
  }

  if (USE_MONGO) {
    const { mongoRecipeRepo } = await import("./mongoRecipeRepo");
    recipeRepo = mongoRecipeRepo;
  } else {
    recipeRepo = memoryRecipeRepo;
  }

  return recipeRepo;
}
