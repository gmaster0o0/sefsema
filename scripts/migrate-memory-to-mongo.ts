import { config as loadEnv } from "dotenv";
// Load .env.local first (Next.js convention), then fallback to .env
loadEnv({ path: ".env.local" });
loadEnv();

// Do not statically import modules that read process.env at module-eval time.
// We'll dynamically import them after loading env variables.

async function migrate() {
  const { getMongoDb } = await import("../app/lib/mongodb");
  const { memoryRecipeRepo, memoryUserRepo } = await import("../app/lib/store");

  const db = await getMongoDb();

  // Migrate users
  const usersCollection = db.collection("users");
  const users = await memoryUserRepo.listUsers();
  if (users.length === 0) {
    console.log("No users found in memory repo — skipping users migration.");
  } else {
    for (const u of users) {
      await usersCollection.updateOne(
        { legacyId: u.id },
        {
          $setOnInsert: {
            legacyId: u.id,
            username: u.username,
            email: u.email,
            role: u.role,
            passwordHash: u.passwordHash,
            createdAt: u.createdAt,
          },
        },
        { upsert: true },
      );
    }
    console.log(`Upserted ${users.length} users into MongoDB.`);
  }

  // Migrate recipes
  const recipesCollection = db.collection("recipes");
  const recipes = await memoryRecipeRepo.listRecipes();
  if (recipes.length === 0) {
    console.log("No recipes found in memory repo — skipping recipes migration.");
  } else {
    for (const r of recipes) {
      await recipesCollection.updateOne(
        { legacyId: r.id },
        {
          $setOnInsert: {
            legacyId: r.id,
            userId: r.userId,
            title: r.title,
            slug: r.slug,
            imageUrl: r.imageUrl,
            ingredients: r.ingredients,
            preparation: r.preparation,
            tags: r.tags,
            isPublic: r.isPublic,
            createdAt: r.createdAt,
          },
        },
        { upsert: true },
      );
    }
    console.log(`Upserted ${recipes.length} recipes into MongoDB.`);
  }

  console.log("Migration completed.");
  process.exit(0);
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
