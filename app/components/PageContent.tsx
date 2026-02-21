"use client";

import Header from "./Header";
import RecipeList from "./RecipeList";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Recipe } from "../lib/store";

type PageContentProps = {
  currentUser: { id: string; username: string; role: string } | null | undefined;
  publicRecipes: Recipe[];
  userRecipes: Recipe[];
};

export default function PageContent({ currentUser, publicRecipes, userRecipes }: PageContentProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [headerQuery, setHeaderQuery] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const q = searchParams?.get("q") ?? "";
    setHeaderQuery(q);
  }, [searchParams]);

  return (
    <>
      <Header
        currentUser={currentUser}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        searchQuery={headerQuery}
        setSearchQuery={setHeaderQuery}
      />
      <RecipeList
        publicRecipes={publicRecipes}
        userRecipes={userRecipes}
        currentUser={currentUser}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        titleSearch={headerQuery}
      />
    </>
  );
}
