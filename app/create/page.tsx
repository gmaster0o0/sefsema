import { redirect } from "next/navigation";
import Link from "next/link";

import CreateRecipeForm from "../components/CreateRecipeForm";
import { getCurrentUser } from "../lib/auth";

export default async function CreateRecipePage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth");
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-900">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="flex items-center gap-4">
          <Link
            href="/"
            className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50"
          >
            ← Vissza
          </Link>
          <div>
            <h1 className="text-3xl font-semibold">Új recept</h1>
            <p className="mt-1 text-sm text-zinc-500">Készíts egy új receptet képekkel és hozzávalókkal</p>
          </div>
        </header>

        <CreateRecipeForm />
      </main>
    </div>
  );
}
