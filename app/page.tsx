import Link from "next/link";

import RecipeManager from "@/app/components/RecipeManager";
import PublicRecipes from "@/app/components/PublicRecipes";
import { getCurrentUser } from "./lib/auth";
import { logoutAction } from "./actions/auth";
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
        <header className="flex flex-col gap-6 rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Recept megosztó alkalmazás</p>
              <h1 className="text-4xl font-semibold leading-tight">Publikus receptek</h1>
            </div>
            <div className="flex items-center gap-3 text-sm">
              {currentUser ? (
                <>
                  <Link
                    href="/create"
                    className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                  >
                    + Új recept
                  </Link>
                  <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <div>
                      <p className="font-semibold text-emerald-900">{currentUser.username}</p>
                      <p className="text-xs text-emerald-700">{currentUser.role}</p>
                    </div>
                    <form action={logoutAction}>
                      <button className="rounded-lg border border-emerald-300 bg-white px-3 py-1 text-sm font-semibold text-emerald-700 hover:bg-emerald-100">
                        Kijelentkezés
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50"
                >
                  Bejelentkezés
                </Link>
              )}
            </div>
          </div>
          <p className="max-w-2xl text-base text-zinc-600">
            Példa alkalmazás: az adatok törlődnek a dev szerver újraindításakor. Készíts recepteket képekkel!
          </p>
        </header>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Publikus receptek</h2>
          <PublicRecipes recipes={publicRecipes} />
        </section>

        {currentUser ? (
          <RecipeManager recipes={userRecipes} />
        ) : (
          <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Receptek létrehozása</h2>
            <p className="mt-2 text-sm text-zinc-500">
              <Link href="/auth" className="font-semibold text-zinc-900">
                Jelentkezz be
              </Link>{" "}
              hogy létrehozhass és kezelhesd saját receptjeidet.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
