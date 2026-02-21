"use client";

import Header from "@/app/components/Header";
import RecipeList from "@/app/components/RecipeList";
import { useState } from "react";
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
      <RecipeList
        publicRecipes={publicRecipes}
        userRecipes={userRecipes}
        currentUser={currentUser}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
      />
    </>
  );
}
