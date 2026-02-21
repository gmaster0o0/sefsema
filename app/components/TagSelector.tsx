"use client";

import { TAG_GROUPS } from "../lib/tags";

type TagSelectorProps = {
  selectedTags: string[];
  onToggle: (tag: string) => void;
  variant?: "filter" | "edit";
};

export default function TagSelector({ selectedTags, onToggle, variant = "edit" }: TagSelectorProps) {
  return (
    <div className="grid gap-3">
      <p className="text-sm font-semibold">{variant === "filter" ? "Szűrés tagek alapján" : "Tagek"}</p>
      {TAG_GROUPS.map((group) => (
        <div key={group.label} className="grid gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{group.label}</p>
          <div className="flex flex-wrap gap-2">
            {group.tags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onToggle(tag)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    isSelected
                      ? "border-black bg-black text-white"
                      : "border-black/10 bg-white text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {variant === "edit" && <p className="text-xs text-zinc-400">Több taget is kiválaszthatsz.</p>}
    </div>
  );
}
