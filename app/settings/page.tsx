import Link from "next/link";

import { getCurrentUser } from "../lib/auth";
import PasswordForm from "./PasswordForm";
import ProfileForm from "./ProfileForm";

export default async function SettingsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-900">
        <main className="mx-auto w-full max-w-3xl">
          <p className="text-center text-sm text-zinc-600">Nem vagy bejelentkezve.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-900">
      <main className="mx-auto w-full max-w-3xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Beallitasok</h1>
            <p className="mt-2 text-sm text-zinc-600">Alap beallitasok a profilhoz es a felulethez.</p>
          </div>
          <Link
            href="/"
            className="rounded-lg bg-[#e09849] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
          >
            Vissza a fooldalra
          </Link>
        </div>

        <ProfileForm currentUser={currentUser} />

        <PasswordForm />

        <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Megjelenes</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              Tema
              <select className="rounded-lg border border-black/10 px-3 py-2">
                <option>Vilagos</option>
                <option>Sotet</option>
                <option>Rendszer</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              Betumeret
              <select className="rounded-lg border border-black/10 px-3 py-2">
                <option>Kicsi</option>
                <option>Normal</option>
                <option>Nagy</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm sm:col-span-2">
              Nyelv
              <select className="rounded-lg border border-black/10 px-3 py-2">
                <option>Magyar</option>
                <option>English</option>
                <option>Deutsch</option>
              </select>
            </label>
          </div>
          <button className="mt-4 rounded-lg bg-[#e09849] px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
            Mentes
          </button>
        </section>
      </main>
    </div>
  );
}
