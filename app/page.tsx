import PageContent from "./components/PageContent";
import { getCurrentUser } from "./lib/auth";
import { memoryRecipeRepo } from "./lib/store";

export default async function Home() {
  const currentUser = await getCurrentUser();
  const allPublicRecipes = await memoryRecipeRepo.listPublicRecipes();
  // Kiszűrjük a bejelentkezett user receptjeit a publikusok közül
  const publicRecipes = currentUser
    ? allPublicRecipes.filter((recipe) => recipe.userId !== currentUser.id)
    : allPublicRecipes;
  const userRecipes = currentUser ? await memoryRecipeRepo.listUserRecipes(currentUser.id) : [];

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-900">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <PageContent currentUser={currentUser} publicRecipes={publicRecipes} userRecipes={userRecipes} />
      </main>
    </div>
  );
}
