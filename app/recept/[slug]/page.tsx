import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { getRecipeRepo } from "@/app/lib/getRecipeRepo";

type RecipePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function RecipePage({ params }: RecipePageProps) {
  const { slug } = await params;
  const recipeRepo = await getRecipeRepo();
  const recipe = await recipeRepo.findBySlug(slug);

  if (!recipe) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-900">
      <main className="mx-auto w-full max-w-4xl">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Vissza a receptekhez
        </Link>

        <article className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-lg">
          {recipe.imageUrl && (
            <div className="relative h-80 w-full md:h-96">
              <Image src={recipe.imageUrl} alt={recipe.title} fill className="object-cover" unoptimized />
            </div>
          )}

          <div className="p-8 md:p-12">
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-zinc-900 md:text-5xl">{recipe.title}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                {recipe.isPublic && (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                    Publikus recept
                  </span>
                )}
                {recipe.tags?.map((tag, idx) => (
                  <span key={idx} className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {recipe.ingredients.length > 0 && (
              <section className="mb-8">
                <h2 className="mb-4 text-2xl font-semibold text-zinc-900">Hozzávalók</h2>
                <ul className="space-y-3">
                  {recipe.ingredients.map((ingredient, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-zinc-700">
                      <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-zinc-400" />
                      <span className="text-lg">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {recipe.preparation && (
              <section>
                <h2 className="mb-4 text-2xl font-semibold text-zinc-900">Elkészítés</h2>
                <p className="whitespace-pre-line text-lg leading-relaxed text-zinc-700">{recipe.preparation}</p>
              </section>
            )}
          </div>
        </article>
      </main>
    </div>
  );
}
