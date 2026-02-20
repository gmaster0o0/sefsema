import type { Recipe } from "./store";

/**
 * Normalizálja az alapanyag nevet: eltávolítja a mennyiségi adatokat,
 * kisbetűssé alakítja, és trimeli.
 */
export function normalizeIngredient(ingredient: string): string {
  // Eltávolítjuk a mennyiségi információkat (pl. "2 csésze liszt" -> "liszt")
  // Keressük meg az utolsó szó kezdetét
  const parts = ingredient.trim().split(/\s+/);

  // Ha csak egy szó van, akkor az maga az alapanyag
  if (parts.length === 1) {
    return ingredient.trim().toLowerCase();
  }

  // A számokat és mértékegységeket általában az elején írjuk
  // Keressük meg az első szót, ami nem szám és nem mértékegység
  const commonUnits = [
    "csésze",
    "csészék",
    "tk",
    "ek",
    "ml",
    "dl",
    "l",
    "g",
    "dkg",
    "kg",
    "db",
    "gerezd",
    "csipet",
    "csokor",
    "ág",
    "csomag",
    "doboz",
    "liter",
  ];

  let ingredientName = parts
    .filter((part) => {
      const lower = part.toLowerCase();
      // Kihagyjuk a számokat és általános mértékegységeket
      return !(/^\d+/.test(part) || commonUnits.includes(lower) || lower === "/" || lower === "-");
    })
    .join(" ");

  // Ha nincs eredmény, használjuk az eredeti nevet
  if (!ingredientName) {
    ingredientName = ingredient;
  }

  return ingredientName.trim().toLowerCase();
}

/**
 * Kinyeri az összes egyedi alapanyag nevet a receptekből.
 */
export function getAllIngredients(recipes: Recipe[]): string[] {
  const ingredientSet = new Set<string>();

  recipes.forEach((recipe) => {
    recipe.ingredients.forEach((ingredient) => {
      const normalized = normalizeIngredient(ingredient);
      if (normalized) {
        ingredientSet.add(normalized);
      }
    });
  });

  return Array.from(ingredientSet).sort();
}

/**
 * Szűri a javaslatokat a keresési kifejezés alapján.
 */
export function filterIngredientSuggestions(
  allIngredients: string[],
  searchTerm: string,
  selectedIngredients: string[],
  limit = 5,
): string[] {
  if (!searchTerm.trim()) {
    return [];
  }

  const search = searchTerm.toLowerCase().trim();

  return allIngredients
    .filter((ingredient) => ingredient.includes(search) && !selectedIngredients.includes(ingredient))
    .slice(0, limit);
}

/**
 * Ellenőrzi, hogy egy recept tartalmazza-e a megadott alapanyagokat (OR logika).
 */
export function recipeMatchesIngredients(recipe: Recipe, selectedIngredients: string[]): boolean {
  if (selectedIngredients.length === 0) {
    return true;
  }

  const recipeIngredients = recipe.ingredients.map((ing) => normalizeIngredient(ing));

  return selectedIngredients.some((selected) => recipeIngredients.some((recipeIng) => recipeIng.includes(selected)));
}
