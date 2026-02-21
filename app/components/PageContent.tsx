"use client";

import Header from "@/app/components/Header";
import RecipeList from "@/app/components/RecipeList";
import type { Recipe } from "../lib/store";

type PageContentProps = {
  currentUser: { id: string; username: string; role: string } | null | undefined;
  publicRecipes: Recipe[];
  userRecipes: Recipe[];
};

export default function PageContent({ currentUser, publicRecipes, userRecipes }: PageContentProps) {
  return (
    <>
      <Header currentUser={currentUser} />
      <RecipeList publicRecipes={publicRecipes} userRecipes={userRecipes} currentUser={currentUser} />
    </>
  );
}
