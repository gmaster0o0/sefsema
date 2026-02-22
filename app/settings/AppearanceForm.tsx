"use client";

import { useActionState, useState } from "react";
import { updateAppearanceAction, type UserActionState } from "../actions/user";
import type { SessionUser } from "../lib/auth";
import { useEffect } from "react";

const initialState: UserActionState = { ok: false, message: "" };

type AppearanceFormProps = {
  currentUser: SessionUser;
};

export default function AppearanceForm({ currentUser }: AppearanceFormProps) {
  const [state, formAction, isPending] = useActionState(updateAppearanceAction, initialState);
  const [theme, setTheme] = useState<string>(currentUser.theme ?? "system");
  const [fontSize, setFontSize] = useState<string>(currentUser.fontSize ?? "normal");

  useEffect(() => {
    // Apply theme immediately on client
    const body = document.body;
    // theme
    if (theme === "dark") {
      body.classList.add("dark");
    } else {
      body.classList.remove("dark");
    }

    // font size - remove previous classes then add new
    body.classList.remove("text-sm", "text-base", "text-lg");
    const map: Record<string, string> = { small: "text-sm", normal: "text-base", large: "text-lg" };
    body.classList.add(map[fontSize] || "text-base");

    return () => {
      // cleanup not strictly necessary, keep body tidy
    };
  }, [theme, fontSize]);

  return (
    <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Megjelenes</h2>

      {state.message && (
        <div
          className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
            state.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {state.message}
        </div>
      )}

      <form action={formAction}>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            Tema
            <select
              name="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="rounded-lg border border-black/10 px-3 py-2"
              disabled={isPending}
            >
              <option value="light">Vilagos</option>
              <option value="dark">Sotet</option>
              <option value="system">Rendszer</option>
            </select>
          </label>

          <label className="grid gap-1 text-sm">
            Betumeret
            <select
              name="fontSize"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              className="rounded-lg border border-black/10 px-3 py-2"
              disabled={isPending}
            >
              <option value="small">Kicsi</option>
              <option value="normal">Normal</option>
              <option value="large">Nagy</option>
            </select>
          </label>

          <label className="grid gap-1 text-sm sm:col-span-2">
            Nyelv
            <select className="rounded-lg border border-black/10 px-3 py-2" disabled>
              <option>Magyar</option>
              <option>English</option>
              <option>Deutsch</option>
            </select>
          </label>
        </div>

        <button
          type="submit"
          className="mt-4 rounded-lg bg-[#e09849] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          disabled={isPending}
        >
          {isPending ? "Feldolgozas..." : "Mentes"}
        </button>
      </form>
    </section>
  );
}
