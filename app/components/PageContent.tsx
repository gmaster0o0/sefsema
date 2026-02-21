"use client";

import { useState } from "react";
import Link from "next/link";
import RecipeManager from "@/app/components/RecipeManager";
import PublicRecipes from "@/app/components/PublicRecipes";
import Header from "@/app/components/Header";
import type { Recipe } from "../lib/store";

type PageContentProps = {
  currentUser: { id: string; username: string; role: string } | null | undefined;
  publicRecipes: Recipe[];
  userRecipes: Recipe[];
};

export default function PageContent({ currentUser, publicRecipes, userRecipes }: PageContentProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <>
      <Header currentUser={currentUser} showFilters={showFilters} setShowFilters={setShowFilters} />

      <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Publikus receptek</h2>
        <PublicRecipes recipes={publicRecipes} showFilters={showFilters} />
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
    </>
  );
}
