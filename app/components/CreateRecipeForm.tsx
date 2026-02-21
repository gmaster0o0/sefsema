"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { RecipeState } from "../actions/recipes";
import { createRecipeAction } from "../actions/recipes";
import TagSelector from "./TagSelector";

const initialState: RecipeState = { ok: false, message: "" };

export default function CreateRecipeForm() {
  const [state, formAction] = useActionState(createRecipeAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (state.ok && formRef.current) {
      formRef.current.reset();
      // avoid calling setState synchronously inside effect
      setTimeout(() => {
        setSelectedTags([]);
      }, 0);

      setTimeout(() => {
        router.push("/");
      }, 1000);
    }
  }, [state.ok, router]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  return (
    <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Recept létrehozása</h2>
      <p className="mt-1 text-sm text-zinc-500">Hozz létre egy új receptet, amit nyilvánossá tehetsz.</p>

      <form ref={formRef} action={formAction} className="mt-4 grid gap-3">
        <label className="grid gap-1 text-sm">
          Cím
          <input
            name="title"
            className="rounded-lg border border-black/10 px-3 py-2"
            placeholder="Csokis süti"
            required
          />
        </label>
        <label className="grid gap-1 text-sm">
          Kép URL (opcionális)
          <input
            name="imageUrl"
            type="url"
            className="rounded-lg border border-black/10 px-3 py-2"
            placeholder="https://example.com/image.jpg"
          />
          <span className="text-xs text-zinc-400">
            Ha üresen hagyod, automatikusan generálunk egy képet a cím alapján.
          </span>
        </label>
        <label className="grid gap-1 text-sm">
          Hozzávalók (soronként egy)
          <textarea
            name="ingredients"
            className="min-h-24 rounded-lg border border-black/10 px-3 py-2"
            placeholder="2 csésze liszt&#10;1 csésze cukor&#10;3 tojás"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Elkészítés
          <textarea
            name="preparation"
            className="min-h-32 rounded-lg border border-black/10 px-3 py-2"
            placeholder="Részletes leírás az elkészítésről..."
            required
          />
        </label>
        <div className="grid gap-3">
          <p className="text-sm font-semibold">Tagek</p>
          <input type="hidden" name="tags" value={selectedTags.join(", ")} />
          <TagSelector variant="edit" selectedTags={selectedTags} onToggle={toggleTag} />
          <p className="text-xs text-zinc-400">Több taget is kiválaszthatsz.</p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input name="isPublic" type="checkbox" className="h-4 w-4" />
          Publikus recept (mindenki láthatja)
        </label>
        <button className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white">Recept létrehozása</button>
        {state.message ? (
          <p className={`text-sm ${state.ok ? "text-emerald-600" : "text-red-600"}`}>{state.message}</p>
        ) : null}
      </form>
    </section>
  );
}
