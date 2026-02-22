"use client";

import { useActionState } from "react";

import { changePasswordAction, type UserActionState } from "../actions/user";

const initialState: UserActionState = { ok: false, message: "" };

export default function PasswordForm() {
  const [state, formAction, isPending] = useActionState(changePasswordAction, initialState);

  return (
    <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Jelszo</h2>

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
        <div className="mt-4 grid gap-4">
          <label className="grid gap-1 text-sm">
            Jelenlegi jelszo
            <input
              name="currentPassword"
              type="password"
              className="rounded-lg border border-black/10 px-3 py-2"
              required
              disabled={isPending}
            />
          </label>
          <label className="grid gap-1 text-sm">
            Uj jelszo
            <input
              name="newPassword"
              type="password"
              className="rounded-lg border border-black/10 px-3 py-2"
              minLength={8}
              required
              disabled={isPending}
            />
          </label>
          <label className="grid gap-1 text-sm">
            Uj jelszo megerositese
            <input
              name="confirmPassword"
              type="password"
              className="rounded-lg border border-black/10 px-3 py-2"
              minLength={8}
              required
              disabled={isPending}
            />
          </label>
        </div>
        <button
          type="submit"
          className="mt-4 rounded-lg bg-[#e09849] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          disabled={isPending}
        >
          {isPending ? "Feldolgozas..." : "Jelszo csere"}
        </button>
      </form>
    </section>
  );
}
