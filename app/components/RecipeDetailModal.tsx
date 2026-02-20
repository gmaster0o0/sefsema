"use client";

import Image from "next/image";
import type { Recipe } from "../lib/store";

type RecipeDetailModalProps = {
  recipe: Recipe | null;
  onClose: () => void;
};

export default function RecipeDetailModal({ recipe, onClose }: RecipeDetailModalProps) {
  if (!recipe) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {recipe.imageUrl && (
          <div className="relative h-64 w-full md:h-80">
            <Image src={recipe.imageUrl} alt={recipe.title} fill className="object-cover" unoptimized />
          </div>
        )}
        <div className="p-6 md:p-8">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 className="text-2xl font-bold text-zinc-900 md:text-3xl">{recipe.title}</h2>
            <button
              onClick={onClose}
              className="flex-shrink-0 rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
              aria-label="Bezárás"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {recipe.ingredients.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-semibold text-zinc-900">Hozzávalók</h3>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-zinc-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-zinc-400" />
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recipe.preparation && (
            <div>
              <h3 className="mb-3 text-lg font-semibold text-zinc-900">Elkészítés</h3>
              <p className="whitespace-pre-line text-zinc-700">{recipe.preparation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
